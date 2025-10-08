import { PrismaClient } from '@prisma/client';

export async function seedSettingsAndFeatureFlags(prisma: PrismaClient) {
  // -----------------------------
  // Seed Settings & Feature Flags
  // -----------------------------
  console.log('\n⚙️ Seeding platform settings...');
  await prisma.setting.upsert({
    where: { key: 'maintenanceMode' },
    update: {},
    create: {
      key: 'maintenanceMode',
      value: false,
      description: 'If true, the entire public-facing site will be disabled.',
    },
  });

  await prisma.setting.upsert({
      where: { key: 'freeJobPostLimit' },
      update: {},
      create: {
          key: 'freeJobPostLimit',
          value: 1, // Store as a number
          description: "The number of open jobs an agency on the 'Free' plan can have."
      }
  });
  
  await prisma.setting.upsert({
      where: { key: 'freeMemberLimit' },
      update: {},
      create: {
          key: 'freeMemberLimit',
          value: 1,
          description: "The number of team members an agency on the 'Free' plan can have."
      }
  });

  console.log('Seeding feature flags...');
  await prisma.featureFlag.upsert({
    where: { name: 'enableAiRecommendations' },
    update: {},
    create: {
      name: 'enableAiRecommendations',
      description: 'Enables the AI-powered candidate matching feature for Enterprise agencies.',
      isEnabled: false, // Default to off
    },
  });
  console.log('Static data seeding complete.');
}