import { PrismaClient } from '@prisma/client';
import { cleanupDatabase } from './seed/cleanup';
import { seedLocations } from './seed/static/locations';
import { seedIndustries } from './seed/static/industries';
import { seedSettingsAndFeatureFlags } from './seed/static/settings';
import { seedSkills } from './seed/static/skills';
import { seedQuizzes } from './seed/static/quizzes';
import { createCandidates } from './seed/generators/candidates';
import { createAgencies } from './seed/generators/agencies';
import { createJobs } from './seed/generators/jobs';
import { createApplicationsForSpecificPosition } from './seed/generators/applications';

const prisma = new PrismaClient();

async function main() {
  console.log('💧 Starting database seeding...');

  await cleanupDatabase(prisma);

  // --- Static Data Seeding ---
  await seedLocations(prisma);
  await seedIndustries(prisma);
  await seedSettingsAndFeatureFlags(prisma);
  await seedSkills(prisma);

  // --- Dynamic Data Generation ---
  console.log('\n🔥 Seeding dynamic data...');
  await createCandidates(prisma, 100);
  await createAgencies(prisma, 20);
  await createJobs(prisma, 100);

  // Manually adding 70 candidates to a target position ID for testing.
  const targetPositionId = 'd45805c9-c04f-4f5a-8beb-5cc970888e66';
  await createApplicationsForSpecificPosition(prisma, 70, targetPositionId);

  // Seed quizzes last as they may depend on skills
  await seedQuizzes(prisma);

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