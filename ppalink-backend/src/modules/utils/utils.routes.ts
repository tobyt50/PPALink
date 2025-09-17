import { Router } from 'express';
import { getAllCoursesHandler, getAllDegreesHandler, getAllIndustriesHandler, getAllLocationStatesHandler, getAllUniversitiesHandler, getLgasByStateIdHandler } from './utils.controller';

const router = Router();

// Public route to get all industries
// GET /api/utils/industries
router.get('/industries', getAllIndustriesHandler);

// Public route to get all location states
// GET /api/utils/location-states
router.get('/location-states', getAllLocationStatesHandler);

// GET /api/utils/location-states/:stateId/lgas
router.get('/location-states/:stateId/lgas', getLgasByStateIdHandler);

router.get('/universities', getAllUniversitiesHandler);
router.get('/courses', getAllCoursesHandler);
router.get('/degrees', getAllDegreesHandler);

export default router;