import prisma from '../../config/db';

/**
 * Fetches all countries, ordered by name.
 */
export async function getAllCountries() {
  return prisma.country.findMany({
    orderBy: { name: 'asc' },
  });
}

/**
 * Fetches all regions (states/provinces) for a specific country.
 * @param countryId The ID of the parent country.
 */
export async function getRegionsByCountry(countryId: number) {
  return prisma.region.findMany({
    where: { countryId },
    orderBy: { name: 'asc' },
  });
}

/**
 * Fetches all cities for a specific region.
 * @param regionId The ID of the parent region.
 */
export async function getCitiesByRegion(regionId: number) {
  return prisma.city.findMany({
    where: { regionId },
    orderBy: { name: 'asc' },
  });
}