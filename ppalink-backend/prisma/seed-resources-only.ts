import { PrismaClient } from '@prisma/client';
import { seedContent } from './seed/static/resources';  // Adjust path if needed

const prisma = new PrismaClient();

async function main() {
  console.log('💧 Starting isolated content seeding (no cleanup)...');
  
  // Run the content seed directly (includes resources and feed items)
  await seedContent(prisma);
  
  console.log('✅ Isolated content seeding completed.');
}

main()
  .catch((e) => {
    console.error('❌ An error occurred during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });