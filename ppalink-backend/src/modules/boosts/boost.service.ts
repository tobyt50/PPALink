import { env } from 'process';
import prisma from '../../config/db';
import { stripe } from '../../config/stripe';
import { BoostTier, BoostStatus } from '@prisma/client';
import { addDays } from 'date-fns';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Creates a Stripe Checkout Session for an agency to boost a feed post.
 */
export async function createBoostCheckoutSession(
    userId: string,
    userEmail: string,
    feedItemId: string,
    tierName: 'STANDARD' | 'PREMIUM'
) {
    const boostTier = await prisma.boostTier.findUnique({
        where: { name: tierName }
    });

    if (!boostTier) {
        throw new Error(`Boost tier "${tierName}" not found.`);
    }
    const priceId = boostTier.stripePriceId;
    if (!priceId) throw new Error('Invalid boost tier selected.');

    const feedItem = await prisma.feedItem.findFirst({
        where: { id: feedItemId, userId: userId }
    });
    if (!feedItem) throw new Error('Feed post not found or you do not have permission to boost it.');
    
    // Retrieve the price from Stripe to get the amount in Naira
    const stripePrice = await stripe.prices.retrieve(priceId);
    const amountInNaira = stripePrice.unit_amount; // This will be 5000 or 15000

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price: priceId, // Use the Price ID from Stripe Dashboard
            quantity: 1,
        }],
        mode: 'payment',
        customer_email: userEmail, // Use the user's email
        metadata: {
            userId,
            feedItemId,
            tierId: boostTier.id,
            amount: String(amountInNaira), // Store the amount in Naira for the webhook
        },
        success_url: `${FRONTEND_URL}/feed?boost=success`,
        cancel_url: `${FRONTEND_URL}/feed?boost=cancelled`,
    });

    if (!session.url) {
        throw new Error('Could not create Stripe Checkout session.');
    }
    
    return { url: session.url, sessionId: session.id };
}

/**
 * Activates a boost after a successful payment webhook.
 */
export async function activateBoost(
    feedItemId: string,
    userId: string,
    tierId: string,
    amount: number,
    stripeCheckoutId: string
) {
    const boostTier = await prisma.boostTier.findUnique({ where: { id: tierId } });
    if (!boostTier) throw new Error('Boost tier not found during activation.');

    const startDate = new Date();
    const endDate = addDays(startDate, boostTier.durationInDays);

    return prisma.feedBoost.create({
        data: {
            feedItemId,
            userId,
            tierId: boostTier.id,
            amount,
            status: BoostStatus.ACTIVE,
            startDate,
            endDate,
            stripeCheckoutId,
        }
    });
}

/**
 * Fetches all available boost tiers to display on the frontend.
 */
export async function getPublicBoostTiers() {
    return prisma.boostTier.findMany({
        orderBy: { price: 'asc' }
    });
}