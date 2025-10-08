import prisma from '../../config/db';
import { addMonths } from 'date-fns';
import { NotificationType, Prisma } from '@prisma/client';

// A standard shuffle algorithm (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}


export async function getAvailableQuizzes(candidateId: string) {
  const candidateSkills = await prisma.candidateSkill.findMany({
    where: { candidateId: candidateId },
    select: { skillId: true },
  });
  const candidateSkillIds = candidateSkills.map(cs => cs.skillId);

  if (candidateSkillIds.length === 0) {
    return [];
  }

  const attemptedQuizzes = await prisma.quizAttempt.findMany({
    where: { candidateId },
    select: { quizId: true, nextRetryAvailableAt: true },
  });

  const quizzesToExclude = attemptedQuizzes
    .filter(attempt => {
        const isPassed = !attempt.nextRetryAvailableAt;
        const isWaitingForRetry = attempt.nextRetryAvailableAt && new Date() < attempt.nextRetryAvailableAt;
        return isPassed || isWaitingForRetry;
    })
    .map(attempt => attempt.quizId);

  const availableQuizzes = await prisma.quiz.findMany({
    where: {
      skillId: { in: candidateSkillIds },
      id: { notIn: quizzesToExclude },
    },
    select: {
      id: true,
      title: true,
      description: true,
      level: true,
      _count: {
        select: { questions: true },
      },
    },
  });

  return availableQuizzes;
}

/**
 * Fetches a single quiz for a candidate to take.
 * It now RANDOMLY selects questions and SHUFFLES the answer options.
 */
export async function getQuizForTaking(quizId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });

  if (!quiz) {
    throw new Error('Quiz not found.');
  }

  const shuffledQuestions = shuffleArray(quiz.questions);
  const questionsForAttempt = shuffledQuestions.slice(0, 10);

  const questionsForFrontend = questionsForAttempt.map(q => {
    const optionsArray = Array.isArray(q.options) ? q.options as string[] : [];
    const shuffledOptions = shuffleArray(optionsArray);
    
    const { correctAnswer, ...questionData } = q;
    
    return {
      ...questionData,
      options: shuffledOptions as Prisma.JsonArray,
    };
  });

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    level: quiz.level,
    questions: questionsForFrontend,
  };
}

/**
 * Submits a candidate's answers, calculates the score, and saves the attempt.
 * Now it checks answers against the stored `correctAnswer` text.
 */
export async function submitQuizAnswers(
  candidateId: string,
  quizId: string,
  answers: { questionId: string; answerText: string }[]
) {
  const lastAttempt = await prisma.quizAttempt.findFirst({
    where: { candidateId, quizId },
    orderBy: { completedAt: 'desc' },
  });

  if (lastAttempt && lastAttempt.nextRetryAvailableAt && new Date() < lastAttempt.nextRetryAvailableAt) {
    throw new Error(`You can retake this quiz after ${lastAttempt.nextRetryAvailableAt.toLocaleDateString()}.`);
  }

  const quizWithAnswers = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });
  if (!quizWithAnswers) throw new Error('Quiz not found.');

  let correctAnswers = 0;
  for (const answer of answers) {
    const question = quizWithAnswers.questions.find(q => q.id === answer.questionId);
    if (question && question.correctAnswer === answer.answerText) {
      correctAnswers++;
    }
  }
  const score = Math.round((correctAnswers / quizWithAnswers.questions.length) * 100);
  const passed = score >= 70;

  const profile = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      select: { userId: true }
  });
  if (!profile) throw new Error("Could not find user profile for this candidate.");

  await prisma.$transaction(async (tx) => {
    await tx.quizAttempt.create({
      data: {
        candidateId,
        quizId,
        skillId: (passed && quizWithAnswers.skillId) ? quizWithAnswers.skillId : null,
        level: quizWithAnswers.level,
        score,
        passed,
        completedAt: new Date(),
        nextRetryAvailableAt: !passed ? addMonths(new Date(), 1) : null,
      },
    });

    if (passed && quizWithAnswers.skillId) {
      const existingSkillLink = await tx.candidateSkill.findFirst({
        where: {
            candidateId: candidateId,
            skillId: quizWithAnswers.skillId,
        },
      });

      if (!existingSkillLink) {
        await tx.candidateSkill.create({
          data: {
            candidateId: candidateId,
            skillId: quizWithAnswers.skillId,
            level: 3, // Default to an "Intermediate" level
          },
        });
      }
    }

    await tx.notification.updateMany({
      where: {
          user: { id: profile.userId },
          type: NotificationType.NEW_QUIZ,
          read: false,
      },
      data: {
          read: true,
      }
    });
  });

  return { score, passed, correctAnswers, totalQuestions: quizWithAnswers.questions.length };
}