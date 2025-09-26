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
import { authenticate } from "./middleware/auth";
import { forcePasswordChange } from "./middleware/forcePasswordChange";
import prisma from './config/db';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(helmet());

// Only apply JSON parsing for non-webhook routes
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

// Stripe Webhook Route (main handler)
app.post(
  '/api/billing/webhook',
  bodyParser.raw({ type: 'application/json' }),
  stripeWebhookHandler
);

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

// Apply JSON parsing for all other routes
app.use(express.json());

// --- Public Routes (no auth) ---
app.use('/api/public', publicRoutes);
app.use('/api/password', passwordRoutes);

// Auth Routes: Login/Register are public, but change-password is protected.
// Handled separately because they have mixed protection levels.
app.use('/api/auth', authRoutes);

// Apply middleware that should run for ALL protected API routes.
app.use(express.json());      // 1. Parse JSON bodies
app.use(authenticate);        // 2. Check for a valid JWT
app.use(forcePasswordChange); // 3. Check if a password change is required

// API Routes
app.use('/api/candidates', authenticate, forcePasswordChange, candidateRoutes);
app.use('/api/agencies', authenticate, forcePasswordChange, agencyRoutes);
app.use('/api/applications', authenticate, forcePasswordChange, applicationRoutes);
app.use('/api/uploads', authenticate, forcePasswordChange, uploadRoutes);
app.use('/api/admin', authenticate, forcePasswordChange, adminRoutes);
app.use('/api/messages', authenticate, forcePasswordChange, messageRoutes);
app.use('/api/notifications', authenticate, forcePasswordChange, notificationRoutes);
app.use('/api/billing', authenticate, forcePasswordChange, billingRoutes);
app.use('/api/utils', authenticate, forcePasswordChange, utilRoutes);

// Temporary testing only
app.get('/api/test-users', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, status: true } });
    res.json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});


// Error handler
app.use(errorHandler);

export default app;
