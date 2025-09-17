import { PrismaClient } from '@prisma/client';
import { industries } from './industries.data';
import { statesAndLgas } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('💧 Starting database seeding...');

  // -----------------------------
  // Seed States & LGAs
  // -----------------------------
  console.log('\n🌍 Seeding states and LGAs...');

  // Delete LGAs first due to foreign key constraints
  await prisma.locationLGA.deleteMany({});
  await prisma.locationState.deleteMany({});
  console.log('Cleared existing location data.');

  for (const stateData of statesAndLgas) {
    const state = await prisma.locationState.create({
      data: { name: stateData.state },
    });
    console.log(`Created state: ${state.name}`);

    if (stateData.lgas && stateData.lgas.length > 0) {
      const lgasToCreate = stateData.lgas.map((lgaName) => ({
        name: lgaName,
        stateId: state.id,
      }));

      await prisma.locationLGA.createMany({
        data: lgasToCreate,
      });

      console.log(` -> Created ${lgasToCreate.length} LGAs for ${state.name}.`);
    }
  }

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

  console.log('\n✅ Database seeding completed successfully.');
}

// Execute main and ensure Prisma disconnects
main()
  .catch((e) => {
    console.error('❌ An error occurred during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
