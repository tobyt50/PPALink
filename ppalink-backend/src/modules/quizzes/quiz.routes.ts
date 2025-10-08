import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import {
  getAvailableQuizzesHandler,
  getQuizForTakingHandler,
  submitQuizAnswersHandler,
} from './quiz.controller';

const router = Router();

// All quiz routes are protected and only for candidates
router.use(authenticate, requireRole([Role.CANDIDATE]));

// GET /api/quizzes/available
router.get('/available', getAvailableQuizzesHandler);

// GET /api/quizzes/:quizId/take
router.get('/:quizId/take', getQuizForTakingHandler);

// POST /api/quizzes/:quizId/submit
router.post('/:quizId/submit', submitQuizAnswersHandler);

export default router;