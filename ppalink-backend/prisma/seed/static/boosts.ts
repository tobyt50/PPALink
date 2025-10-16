import { PrismaClient } from '@prisma/client';

export async function seedBoostTiers(prisma: PrismaClient) {
  console.log('\n🚀 Seeding boost tiers...');

  // It is correct for the SEED file to read from .env.
  // This is a one-time setup action to get the Stripe IDs into the database.
  // The runtime application code will then read from the database, not .env.
  const standardPriceId = process.env.STRIPE_BOOST_STANDARD_PRICE_ID;
  const premiumPriceId = process.env.STRIPE_BOOST_PREMIUM_PRICE_ID;

  if (!standardPriceId || !premiumPriceId) {
    console.error('❌ CRITICAL: Missing STRIPE_BOOST_STANDARD_PRICE_ID or STRIPE_BOOST_PREMIUM_PRICE_ID in your .env file. Skipping boost tier seed.');
    return;
  }

  // --- STANDARD TIER ---
  await prisma.boostTier.upsert({
    where: { name: 'STANDARD' },
    update: {
      // You can update existing values here if you change them
      price: 5000,
      stripePriceId: standardPriceId,
    },
    create: {
      name: 'STANDARD',
      price: 5000,
      durationInDays: 3,
      reachMultiplier: 2,
      description: '+2x Reach for 3 Days',
      stripePriceId: standardPriceId,
    },
  });

  // --- PREMIUM TIER ---
  await prisma.boostTier.upsert({
    where: { name: 'PREMIUM' },
    update: {
      price: 15000,
      stripePriceId: premiumPriceId,
    },
    create: {
      name: 'PREMIUM',
      price: 15000,
      durationInDays: 7,
      reachMultiplier: 5,
      description: '+5x Reach for 7 Days',
      stripePriceId: premiumPriceId,
    },
  });

  console.log('✅ Boost tiers seeded successfully.');
}