import { PrismaClient } from '@prisma/client';
import { cleanupDatabase } from './seed/utils/cleanup';
import { seedIndustries } from './seed/static/industries';
import { seedSettingsAndFeatureFlags } from './seed/static/settings';
import { seedSkills } from './seed/static/skills';
import { seedQuizzes } from './seed/static/quizzes';
import { createCandidates } from './seed/generators/createCandidates';
import { createAgencies } from './seed/generators/createAgencies';
import { createJobs } from './seed/generators/createJobs';
import { createApplicationsForSpecificPosition } from './seed/generators/applications';
// import { seedGlobalLocations } from './seed/static/locations';
import { seedContent } from './seed/static/resources';
import { seedBoostTiers } from './seed/static/boosts';

const prisma = new PrismaClient();

async function main() {
  console.log('💧 Starting database seeding...');

  // 1. Clean up the database first
  await cleanupDatabase(prisma);

  // 2. Seed static lookup data
  console.log('\n- Seeding all static data...');
  // await seedGlobalLocations(prisma);
  await seedIndustries(prisma);
  await seedSettingsAndFeatureFlags(prisma);
  await seedSkills(prisma);
  await seedBoostTiers(prisma);

  // 3. Seed dynamic, generated data
  console.log('\n- Seeding all dynamic data...');
  await createCandidates(prisma, 100);
  await createAgencies(prisma, 20);
  await createJobs(prisma, 100);

  // 4. Create relationships and transactional data
  const targetPositionId = 'd45805c9-c04f-4f5a-8beb-5cc970888e66';
  await createApplicationsForSpecificPosition(prisma, 70, targetPositionId);

  // 5. Seed content that may depend on other data (like skills or users)
  console.log('\n- Seeding content...');
  await seedQuizzes(prisma);
  await seedContent(prisma);


  console.log('\n✅ Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ An error occurred during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });