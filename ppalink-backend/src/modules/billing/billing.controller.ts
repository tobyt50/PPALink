import { NextFunction, Request, Response } from 'express';
import type Stripe from 'stripe';
import env from '../../config/env';
import { stripe } from '../../config/stripe';
import type { AuthRequest } from '../../middleware/auth';
import { createCheckoutSession, createPortalSession, getSubscriptionPlans, handleWebhookEvent } from './billing.service';

/**
 * Handler for creating a Stripe Checkout Session for a subscription.
 */
export async function createCheckoutSessionHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ success: false, message: 'planId is required.' });
    }

    const { url } = await createCheckoutSession({ user: req.user, planId });
    
    // Send the checkout URL back to the frontend
    return res.status(200).json({ success: true, data: { url } });
  } catch (error: any) {
    if (error.message.includes('already have an active subscription')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
}

/**
 * Handler for fetching all available subscription plans.
 */
export const getSubscriptionPlansHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plans = await getSubscriptionPlans();
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler for receiving and processing Stripe webhook events.
 */
export async function stripeWebhookHandler(req: Request, res: Response, next: NextFunction) {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    // 1. Verify the event came from Stripe using the webhook secret
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Pass the verified event to our service to handle the business logic
  try {
    await handleWebhookEvent(event);
  } catch (error) {
    console.error("Error handling webhook event:", error);
    // Even if our logic fails, we send a 200 to Stripe to acknowledge receipt.
    // Stripe will retry if we send a non-200 status.
  }
  
  // 3. Acknowledge receipt of the event
  res.status(200).json({ received: true });
}

export async function createPortalSessionHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  try {
      const { url } = await createPortalSession(req.user);
      res.status(200).json({ success: true, data: { url } });
  } catch (error) { next(error); }
}