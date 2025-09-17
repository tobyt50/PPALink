import bodyParser from "body-parser";
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { stripe } from "./config/stripe";
import { errorHandler } from './middleware/errorHandler';
import adminRoutes from './modules/admin/admin.routes';
import agencyRoutes from './modules/agencies/agency.routes';
import applicationRoutes from './modules/applications/application.routes';
import authRoutes from './modules/auth/auth.routes';
import { stripeWebhookHandler } from './modules/billing/billing.controller';
import billingRoutes from './modules/billing/billing.routes';
import candidateRoutes from './modules/candidates/candidate.routes';
import messageRoutes from './modules/messaging/message.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import passwordRoutes from './modules/password/password.routes';
import publicRoutes from './modules/public/public.routes';
import uploadRoutes from './modules/uploads/upload.routes';
import utilRoutes from './modules/utils/utils.routes';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());

// ✅ Only apply JSON parsing for non-webhook routes
app.use((req, res, next) => {
  if (req.originalUrl === "/webhook" || req.originalUrl === "/api/billing/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'ppalink backend running' });
});

// Test webhook route
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log("✅ Webhook verified:", event.type);
    } catch (err: any) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        console.log("💰 Checkout session completed!");
        break;
      case "customer.subscription.created":
        console.log("📦 Subscription created!");
        break;
      case "invoice.payment_succeeded":
        console.log("✅ Invoice payment succeeded!");
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

// Stripe Webhook Route (your main handler)
app.post(
  '/api/billing/webhook',
  bodyParser.raw({ type: 'application/json' }),
  stripeWebhookHandler
);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/utils', utilRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/billing', billingRoutes);

// Error handler
app.use(errorHandler);

export default app;
