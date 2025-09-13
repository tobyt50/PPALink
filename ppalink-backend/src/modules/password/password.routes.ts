import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { requestPasswordResetHandler, resetPasswordHandler } from './password.controller';

const router = Router();

// Validation schema for the request
const requestSchema = z.object({
  email: z.string().email('Please provide a valid email address.'),
});

// Validation schema for the reset action
const resetSchema = z.object({
  token: z.string().min(1, 'Token is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
});

// POST /api/password/request-reset
router.post('/request-reset', validate(requestSchema), requestPasswordResetHandler);

// POST /api/password/reset
router.post('/reset', validate(resetSchema), resetPasswordHandler);

export default router;