import type { SubscriptionStatus, User } from '@prisma/client';
import type Stripe from 'stripe';
import prisma from '../../config/db';
import { stripe } from '../../config/stripe';

interface CreateCheckoutSessionInput {
  user: User;
  planId: string; // The ID of the SubscriptionPlan from our database
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Creates a Stripe Checkout Session for an agency to subscribe to a plan.
 * @param data - Contains the user and the plan ID they want to subscribe to.
 */
export async function createCheckoutSession({ user, planId }: CreateCheckoutSessionInput) {
  // 1. Find the agency associated with the user
  const agency = await prisma.agency.findFirst({
    where: { ownerUserId: user.id },
    include: { subscriptions: true },
  });

  if (!agency) {
    throw new Error('Agency not found for the current user.');
  }

  // 2. Check if the agency already has an active subscription
  if (agency.subscriptions.some(sub => sub.status === 'ACTIVE')) {
    // In the future, we can redirect them to a billing management portal
    throw new Error('You already have an active subscription.');
  }
  
  // 3. Find the plan in our database to get the Stripe Price ID
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new Error('Subscription plan not found.');
  }

  // 4. Create a new Stripe Checkout Session
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: user.email, // Pre-fill the customer's email
    line_items: [
      {
        price: plan.stripePriceId, // The ID of the price object in Stripe
        quantity: 1,
      },
    ],
    // We pass metadata to link this session back to our internal user and agency IDs
    metadata: {
      userId: user.id,
      agencyId: agency.id,
      planId: plan.id,
    },
    // Define the URLs for success and cancellation
    success_url: `${FRONTEND_URL}/dashboard/agency/billing?status=success`,
    cancel_url: `${FRONTEND_URL}/dashboard/agency/billing?status=cancelled`,
  });

  if (!checkoutSession.url) {
    throw new Error('Could not create Stripe Checkout session.');
  }
  
  // 5. Return the secure URL for the Stripe-hosted checkout page
  return { url: checkoutSession.url };
}

/**
 * Fetches all available subscription plans from the database.
 */
export async function getSubscriptionPlans() {
  return prisma.subscriptionPlan.findMany({
    orderBy: {
      price: 'asc', // Show the cheapest plan first
    },
  });
}

/**
 * Handles incoming Stripe webhook events to manage subscription lifecycle.
 * @param event The Stripe event object.
 */
export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode !== "subscription") {
        return;
      }

      const subscriptionId = session.subscription as string;
      const { userId, agencyId, planId } = session.metadata!;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // Get current_period_end from first subscription item
      const item = subscription.items.data[0];
      const periodEnd = item?.current_period_end
        ? new Date(item.current_period_end * 1000)
        : null;

      await prisma.agencySubscription.create({
        data: {
          agencyId: agencyId,
          planId: planId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripeCurrentPeriodEnd: periodEnd,
          status: subscription.status.toUpperCase() as SubscriptionStatus,
        },
      });

      // ✅ Fetch agency name for logging
      const agency = await prisma.agency.findUnique({
        where: { id: agencyId },
        select: { name: true },
      });

      if (agency) {
        console.log(`✅ Subscription created for agency: ${agency.name} (${agencyId})`);
      } else {
        console.log(`⚠️ Subscription created but agency not found in DB: ${agencyId}`);
      }

      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;

      const item = subscription.items.data[0];
      const periodEnd = item?.current_period_end
        ? new Date(item.current_period_end * 1000)
        : null;

      await prisma.agencySubscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: subscription.status.toUpperCase() as SubscriptionStatus,
          stripeCurrentPeriodEnd: periodEnd,
        },
      });
      console.log(`✅ Subscription updated for ID: ${subscription.id}`);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      const item = subscription.items.data[0];
      const periodEnd = item?.current_period_end
        ? new Date(item.current_period_end * 1000)
        : null;

      await prisma.agencySubscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: "CANCELED",
          stripeCurrentPeriodEnd: periodEnd,
        },
      });
      console.log(`✅ Subscription canceled for ID: ${subscription.id}`);
      break;
    }

    default:
      console.log(`Unhandled webhook event type: ${event.type}`);
  }
}

/**
 * Creates a Stripe Customer Portal session for a user to manage their subscription.
 * @param user The authenticated user object.
 */
export async function createPortalSession(user: User) {
  const agency = await prisma.agency.findFirst({
    where: { ownerUserId: user.id },
    include: { subscriptions: true },
  });

  const subscription = agency?.subscriptions[0];
  if (!subscription || !subscription.stripeCustomerId) {
    throw new Error("No active subscription found to manage.");
  }

  // ✅ Basil API uses billingPortal.sessions.create
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${FRONTEND_URL}/dashboard/agency/billing`,
  });

  return { url: portalSession.url };
}