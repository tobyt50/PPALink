import { Prisma } from '@prisma/client';
import prisma from '../../config/db';
import { stripe } from '../../config/stripe';

interface PlanInput {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  features: string[]; // Prisma expects JsonValue[], but string[] is safer for input
  jobPostLimit: number;
  memberLimit: number;
}

/**
 * Fetches all subscription plans from the database.
 */
export async function getAllPlans() {
  return prisma.subscriptionPlan.findMany({ orderBy: { price: 'asc' } });
}

/**
 * Creates a new subscription plan in our database AND a corresponding product/price in Stripe.
 */
export async function createPlan(data: PlanInput) {
  const product = await stripe.products.create({
    name: data.name,
    description: data.description,
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: data.price,
    currency: data.currency || 'ngn',
    recurring: { interval: 'month' },
  });

  return prisma.subscriptionPlan.create({
    data: {
      ...data,
      features: data.features as Prisma.JsonArray, // Cast to the correct Prisma type
      stripePriceId: price.id,
    },
  });
}

/**
 * Updates an existing subscription plan.
 */
export async function updatePlan(planId: string, data: Partial<PlanInput>) {
  const existingPlan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!existingPlan) throw new Error('Plan not found.');

  //    This object is of a type that CAN include stripePriceId.
  const dataForUpdate: Partial<Prisma.SubscriptionPlanUpdateInput> = { ...data };
  if (data.features) {
      dataForUpdate.features = data.features as Prisma.JsonArray;
  }

  if (data.price !== undefined && data.price !== existingPlan.price) {
    await stripe.prices.update(existingPlan.stripePriceId, { active: false });

    const priceObject = await stripe.prices.retrieve(existingPlan.stripePriceId);
    const productId = priceObject.product as string;

    const newPrice = await stripe.prices.create({
      product: productId,
      unit_amount: data.price,
      currency: data.currency || existingPlan.currency,
      recurring: { interval: 'month' },
    });
    dataForUpdate.stripePriceId = newPrice.id;
  }
  
  return prisma.subscriptionPlan.update({
    where: { id: planId },
    data: dataForUpdate,
  });
}

/**
 * Deletes a subscription plan.
 */
export async function deletePlan(planId: string) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (plan) {
        await stripe.prices.update(plan.stripePriceId, { active: false });
        // Optionally, archive the product as well if no other prices are attached
        // const price = await stripe.prices.retrieve(plan.stripePriceId);
        // await stripe.products.update(price.product as string, { active: false });
    }
    return prisma.subscriptionPlan.delete({ where: { id: planId } });
}