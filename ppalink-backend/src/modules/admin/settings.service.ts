import prisma from '../../config/db';
import { Prisma } from '@prisma/client';

/**
 * Fetches all platform settings.
 */
export async function getAllSettings() {
  return prisma.setting.findMany();
}

/**
 * Updates multiple platform settings in a single transaction.
 * Expects an array of { key: string, value: JsonValue } objects.
 */
export async function updateSettings(settingsToUpdate: { key: string, value: Prisma.JsonValue }[]) {
  const transactions = settingsToUpdate.map(setting => 
    prisma.setting.update({
      where: { key: setting.key },
      data: { value: setting.value as Prisma.InputJsonValue },
    })
  );
  return prisma.$transaction(transactions);
}


/**
 * Fetches all feature flags.
 */
export async function getAllFeatureFlags() {
  return prisma.featureFlag.findMany();
}

/**
 * Updates a single feature flag.
 */
export async function updateFeatureFlag(name: string, isEnabled: boolean) {
  return prisma.featureFlag.update({
    where: { name },
    data: { isEnabled },
  });
}