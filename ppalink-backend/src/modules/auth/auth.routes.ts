import { NextFunction, Request, Response, Router } from 'express';
import { ZodObject, ZodRawShape } from 'zod';
import { loginHandler, registerAgencyHandler, registerCandidateHandler } from './auth.controller';
import { LoginSchema, RegisterAgencySchema, RegisterCandidateSchema } from './auth.types';

const router = Router();

// Generic validation middleware
const validate = (schema: ZodObject<ZodRawShape>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (e: any) {
    res.status(400).json(e.errors);
  }
};

router.post('/register/candidate', validate(RegisterCandidateSchema), registerCandidateHandler);
router.post('/register/agency', validate(RegisterAgencySchema), registerAgencyHandler);
router.post('/login', validate(LoginSchema), loginHandler);

export default router;
