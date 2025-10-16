import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { createBoostCheckoutSessionHandler, getPublicBoostTiersHandler } from './boost.controller';

const router = Router();

router.use(authenticate);

// POST /api/boosts/create-checkout-session
router.post('/create-checkout-session', createBoostCheckoutSessionHandler);

// GET /api/boosts/boost-tiers
router.get('/boost-tiers', getPublicBoostTiersHandler);

export default router;