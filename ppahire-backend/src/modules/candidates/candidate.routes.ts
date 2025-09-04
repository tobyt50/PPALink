import { NextFunction, Request, Response, Router } from 'express';
import { z } from 'zod';
import { registerCandidateHandler } from '../auth/auth.controller';
import { RegisterCandidateSchema } from '../auth/auth.types';

const router = Router();

// Generic Zod validation middleware
const validate = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = schema.parse(req.body); // validate and parse
    next();
  } catch (e: any) {
    return res.status(400).json({ errors: e.errors });
  }
};

router.post(
  '/register',
  validate(RegisterCandidateSchema),
  registerCandidateHandler
);

export default router;
