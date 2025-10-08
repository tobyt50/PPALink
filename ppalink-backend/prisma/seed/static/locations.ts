import { PrismaClient } from '@prisma/client';
import { statesAndLgas } from '../../seed-data';

export async function seedLocations(prisma: PrismaClient) {
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
}