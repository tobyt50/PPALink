import type { SubscriptionStatus, User } from '@prisma/client';
import type Stripe from 'stripe';
import prisma from '../../config/db';
import { emitToAdmins } from '../../config/socket'; // 1. Import the new helper function
import { stripe } from '../../config/stripe';

interface CreateCheckoutSessionInput {
  user: User;
  planId: string;
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export async function createCheckoutSession({ user, planId }: CreateCheckoutSessionInput) {
  const agency = await prisma.agency.findFirst({
    where: { ownerUserId: user.id },
    include: { subscriptions: true },
  });

  if (!agency) {
    throw new Error('Agency not found for the current user.');
  }

  if (agency.subscriptions.some(sub => sub.status === 'ACTIVE')) {
    throw new Error('You already have an active subscription.');
  }
  
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new Error('Subscription plan not found.');
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId: user.id,
      agencyId: agency.id,
      planId: plan.id,
    },
    success_url: `${FRONTEND_URL}/dashboard/agency/billing?status=success`,
    cancel_url: `${FRONTEND_URL}/dashboard/agency/billing?status=cancelled`,
  });

  if (!checkoutSession.url) {
    throw new Error('Could not create Stripe Checkout session.');
  }
  
  return { url: checkoutSession.url };
}

export async function getSubscriptionPlans() {
  return prisma.subscriptionPlan.findMany({
    orderBy: {
      price: 'asc',
    },

  });
}

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

      // --- THIS IS THE FIX ---
      // 2. After successfully creating the subscription, emit an event to all connected admins.
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
      emitToAdmins('admin:subscription_started', {
          userEmail: user?.email,
          planName: plan?.name,
      });
      // --- END OF FIX ---

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
      // ... (no changes needed here)
      break;
    }

    case "customer.subscription.deleted": {
      // ... (no changes needed here)
      break;
    }

    default:
      console.log(`Unhandled webhook event type: ${event.type}`);
  }
}

export async function createPortalSession(user: User) {
  const agency = await prisma.agency.findFirst({
    where: { ownerUserId: user.id },
    include: { subscriptions: true },
  });

  const subscription = agency?.subscriptions[0];
  if (!subscription || !subscription.stripeCustomerId) {
    throw new Error("No active subscription found to manage.");
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${FRONTEND_URL}/dashboard/agency/billing`,
  });

  return { url: portalSession.url };
}