import { PrismaClient } from '@prisma/client';
import { statesAndLgas } from './seed-data';

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with states and LGAs...');

  // 1. Clear existing data to prevent duplicates on re-seeding
  // The order is important due to foreign key constraints (delete LGAs before States)
  await prisma.locationLGA.deleteMany({});
  await prisma.locationState.deleteMany({});
  console.log('Cleared existing location data.');

  // 2. Iterate over each state in our seed data
  for (const stateData of statesAndLgas) {
    // 3. Create the state in the database
    const state = await prisma.locationState.create({
      data: {
        name: stateData.state,
      },
    });

    console.log(`Created state: ${state.name}`);

    // 4. If the state has LGAs, prepare them for creation
    if (stateData.lgas && stateData.lgas.length > 0) {
      const lgasToCreate = stateData.lgas.map((lgaName) => ({
        name: lgaName,
        stateId: state.id, // Link each LGA to the state we just created
      }));

      // 5. Create all LGAs for the current state in a single batch transaction
      await prisma.locationLGA.createMany({
        data: lgasToCreate,
      });

      console.log(` -> Created ${lgasToCreate.length} LGAs for ${state.name}.`);
    }
  }

  console.log('✅ Seeding completed successfully.');
}

// Execute the main function and handle potential errors
main()
  .catch((e) => {
    console.error('❌ An error occurred while seeding the database:', e);
    process.exit(1);
  })
  .finally(async () => {
    // 6. Close the Prisma Client connection
    await prisma.$disconnect();
  });