import { PrismaClient } from '@prisma/client';
import { industries } from '../data/industries';

export async function seedIndustries(prisma: PrismaClient) {
  console.log('🏭 Seeding industries...');

  // No need to deleteMany here, as the main cleanup script handles it.
  await prisma.industry.createMany({
    data: industries.map((i) => ({
      name: i.name.trim(),
      isHeading: i.isHeading ?? false,
      order: i.order,
    })),
  });

  console.log(`  - ✅ Created ${industries.length} industries.`);
}