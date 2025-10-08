import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../../middleware/auth';
import { getMyCandidateProfile } from '../candidates/candidate.service';
import { getAvailableQuizzes, getQuizForTaking, submitQuizAnswers } from './quiz.service';

/**
 * Handler for a candidate to fetch a list of available quizzes.
 */
export async function getAvailableQuizzesHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).send();
  try {
    const profile = await getMyCandidateProfile(req.user.id);
    const quizzes = await getAvailableQuizzes(profile.id);
    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler for a candidate to fetch a single quiz to take.
 */
export async function getQuizForTakingHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).send();
  try {
    const { quizId } = req.params;
    const quiz = await getQuizForTaking(quizId);
    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler for a candidate to submit their answers for a quiz.
 */
export async function submitQuizAnswersHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).send();
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers must be an array.' });
    }

    const profile = await getMyCandidateProfile(req.user.id);
    const result = await submitQuizAnswers(profile.id, quizId, answers);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}