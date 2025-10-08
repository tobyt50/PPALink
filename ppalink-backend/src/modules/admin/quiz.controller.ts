import type { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import {
  adminGetAllQuizzes,
  adminGetQuizById,
  adminCreateQuiz,
  adminUpdateQuiz,
  adminDeleteQuiz,
  adminCreateSkill,
} from './quiz.service';

export async function getAllQuizzesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const quizzes = await adminGetAllQuizzes(req.query);
    res.status(200).json({ success: true, data: quizzes });
  } catch (error) { next(error); }
}

export async function getQuizByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const quiz = await adminGetQuizById(req.params.quizId);
    res.status(200).json({ success: true, data: quiz });
  } catch (error) { next(error); }
}

export async function createQuizHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const newQuiz = await adminCreateQuiz(req.body, req.app.io);
    res.status(201).json({ success: true, data: newQuiz });
  } catch (error) { next(error); }
}

export async function updateQuizHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const updatedQuiz = await adminUpdateQuiz(req.params.quizId, req.body, req.app.io);
    res.status(200).json({ success: true, data: updatedQuiz });
  } catch (error) { next(error); }
}

export async function deleteQuizHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await adminDeleteQuiz(req.params.quizId);
    res.status(204).send();
  } catch (error) { next(error); }
}

export async function createSkillHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Skill name is required.' });
        const newSkill = await adminCreateSkill(name);
        res.status(201).json({ success: true, data: newSkill });
    } catch (error) { next(error); }
}