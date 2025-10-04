import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { loginHandler, registerAgencyHandler, registerCandidateHandler, changePasswordHandler, getMyProfileHandler } from './auth.controller';
import { LoginSchema, RegisterAgencySchema, RegisterCandidateSchema, changePasswordSchema } from './auth.types';
import { generate2faSecretHandler, enable2faHandler, disable2faHandler } from './2fa.controller';

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

router.get(
  '/me/profile',
  authenticate,
  getMyProfileHandler
);

// POST /api/auth/2fa/generate
router.post(
  '/2fa/generate',
  authenticate,
  generate2faSecretHandler
);

// POST /api/auth/2fa/enable
router.post(
  '/2fa/enable',
  authenticate,
  enable2faHandler
);

// POST /api/auth/2fa/disable
router.post(
    '/2fa/disable',
    authenticate,
    disable2faHandler
);

export default router;
