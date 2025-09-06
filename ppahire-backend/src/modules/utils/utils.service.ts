import prisma from '../../config/db';

/**
 * Fetches all industries from the database.
 */
export async function getAllIndustries() {
  return prisma.industry.findMany({
    orderBy: { name: 'asc' },
  });
}

/**
 * Fetches all location states from the database.
 */
export async function getAllLocationStates() {
  return prisma.locationState.findMany({
    orderBy: { name: 'asc' },
  });
}