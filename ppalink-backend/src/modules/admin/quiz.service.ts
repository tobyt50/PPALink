import { NotificationType, Prisma, type QuizLevel } from '@prisma/client';
import type { Server } from 'socket.io';
import prisma from '../../config/db';
import { createNotification } from '../notifications/notification.service';

interface QuizWithQuestionsInput {
  title: string;
  description?: string;
  skillId: number;
  level: QuizLevel;
  questions: {
    id?: string;
    text: string;
    options: string[];
    correctAnswer: string;
  }[];
}

// Helper to broadcast to all online candidates
async function notifyAllCandidates(io: Server, message: string, link: string) {
    const candidates = await prisma.user.findMany({
        where: { role: 'CANDIDATE' },
        select: { id: true }
    });
    // This can be slow for many users. A better approach for scale would be a background job.
    // But for now, this direct approach is fine.
    for (const candidate of candidates) {
        // We call createNotification without `await` in a loop to avoid blocking.
        // This is a "fire-and-forget" notification pattern.
        createNotification({
            userId: candidate.id,
            message: message,
            link: link,
            type: NotificationType.NEW_QUIZ,
        }, io);
    }
}

export async function adminGetAllQuizzes(query: any) {
  const { sortBy = 'title', sortOrder = 'asc', q, level, skillId } = query;

  const where: Prisma.QuizWhereInput = {
    // Keyword search on title and description
    ...(q && {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    }),
    // Filter by level and skill
    level: level ? (level as QuizLevel) : undefined,
    skillId: skillId ? parseInt(skillId, 10) : undefined,
  };

  return prisma.quiz.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    include: { _count: { select: { questions: true } }, skill: { select: { name: true } } },
  });
}

export async function adminGetQuizById(quizId: string) {
  return prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });
}


export async function adminCreateQuiz(data: QuizWithQuestionsInput, io: Server) {
  const newQuiz = await prisma.quiz.create({
    data: {
      title: data.title,
      description: data.description,
      skillId: data.skillId,
      level: data.level,
      questions: {
        create: data.questions.map(q => ({
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
      },
    },
  });

  // Notify all candidates about the new quiz
  await notifyAllCandidates(io, `New Quiz Added: ${newQuiz.title}`, '/dashboard/candidate/assessments');
  
  return newQuiz;
}

export async function adminUpdateQuiz(quizId: string, data: QuizWithQuestionsInput, io: Server) {
  const { questions, ...quizData } = data;

  const updatedQuiz = await prisma.$transaction(async (tx) => {
    const quiz = await tx.quiz.update({
      where: { id: quizId },
      data: quizData,
    });

    const existingQuestions = await tx.question.findMany({ where: { quizId } });
    const existingQuestionIds = new Set(existingQuestions.map(q => q.id));
    const incomingQuestionIds = new Set(questions.map(q => q.id).filter(Boolean));
    
    const questionsToCreate = questions.filter(q => !q.id);
    const questionsToUpdate = questions.filter(q => q.id && existingQuestionIds.has(q.id));
    const questionIdsToDelete = [...existingQuestionIds].filter(id => !incomingQuestionIds.has(id));

    if (questionsToCreate.length > 0) {
      await tx.question.createMany({
        data: questionsToCreate.map(q => ({
          quizId,
          text: q.text,
          options: q.options as Prisma.JsonArray,
          correctAnswer: q.correctAnswer,
        })),
      });
    }

    for (const q of questionsToUpdate) {
      if (q.id) {
        await tx.question.update({
          where: { id: q.id },
          data: {
            text: q.text,
            options: q.options as Prisma.JsonArray,
            correctAnswer: q.correctAnswer,
          }
        });
      }
    }

    if (questionIdsToDelete.length > 0) {
      await tx.question.deleteMany({ where: { id: { in: questionIdsToDelete } } });
    }
    
    await tx.quizAttempt.deleteMany({
        where: { quizId: quizId }
    });
    
    return quiz;
  });

  // Notify all candidates that the quiz has been updated
  await notifyAllCandidates(io, `Quiz Updated: ${updatedQuiz.title}. Please retake it to re-verify your skill.`, '/dashboard/candidate/assessments');

  return updatedQuiz;
}

export async function adminDeleteQuiz(quizId: string) {
    
    return prisma.quiz.delete({ where: { id: quizId } });
}

export async function adminCreateSkill(name: string) {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return prisma.skill.create({
        data: { name, slug }
    });
}