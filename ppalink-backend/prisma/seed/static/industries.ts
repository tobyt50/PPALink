import { PrismaClient } from '@prisma/client';
import { industries } from '../../industries.data';

export async function seedIndustries(prisma: PrismaClient) {
  // -----------------------------
  // Seed Industries
  // -----------------------------
  console.log('\n🏭 Seeding industries...');

  await prisma.industry.deleteMany({});
  console.log('Cleared existing industries.');

  await prisma.industry.createMany({
    data: industries.map((i) => ({
      name: i.name.trim(),
      isHeading: i.isHeading ?? false,
      order: i.order,
    })),
  });

  console.log(`Created ${industries.length} industries with headings + order.`);
}