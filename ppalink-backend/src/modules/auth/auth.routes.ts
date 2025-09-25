import { NextFunction, Request, Response, Router } from 'express';
import { ZodObject, ZodRawShape } from 'zod';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { loginHandler, registerAgencyHandler, registerCandidateHandler, changePasswordHandler } from './auth.controller';
import { LoginSchema, RegisterAgencySchema, RegisterCandidateSchema, changePasswordSchema } from './auth.types';

const router = Router();

router.post('/register/candidate', validate(RegisterCandidateSchema), registerCandidateHandler);
router.post('/register/agency', validate(RegisterAgencySchema), registerAgencyHandler);
router.post('/login', validate(LoginSchema), loginHandler);

router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  changePasswordHandler
);

export default router;
