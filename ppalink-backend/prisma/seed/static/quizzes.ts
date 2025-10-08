import { PrismaClient, QuizLevel } from '@prisma/client';
import { quizData } from '../../quizzes-data';

export async function seedQuizzes(prisma: PrismaClient) {
  console.log('\n🧠 Seeding a full suite of quizzes and questions...');

  await prisma.quiz.deleteMany({});
  console.log('Cleared existing quizzes.');

  const allSkills = await prisma.skill.findMany({
    select: { id: true, name: true, slug: true },
  });

  const skillMap = new Map(allSkills.map(skill => [skill.slug, skill]));
  
  let createdCount = 0;
  for (const [skillSlug, questions] of Object.entries(quizData)) {
    const skill = skillMap.get(skillSlug);

    if (skill) {
      await prisma.quiz.create({
        data: {
          title: `${skill.name} Fundamentals`,
          description: `Test your knowledge of core ${skill.name} concepts.`,
          level: 'BEGINNER',
          skillId: skill.id,
          questions: {
            create: questions,
          },
        },
      });
      createdCount++;
    } else {
      console.warn(`⚠️ Skill with slug "${skillSlug}" not found. Skipping quiz creation.`);
    }
  }

  console.log(`✅ ${createdCount} quizzes created from the data file.`);
}