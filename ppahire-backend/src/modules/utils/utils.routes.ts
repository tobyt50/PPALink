import { Router } from 'express';
import { getAllIndustriesHandler, getAllLocationStatesHandler } from './utils.controller';

const router = Router();

// Public route to get all industries
// GET /api/utils/industries
router.get('/industries', getAllIndustriesHandler);

// Public route to get all location states
// GET /api/utils/location-states
router.get('/location-states', getAllLocationStatesHandler);

export default router;