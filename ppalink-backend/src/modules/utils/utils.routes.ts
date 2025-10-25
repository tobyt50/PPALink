import { Router } from 'express';
import { getAllCoursesHandler, getAllDegreesHandler, getAllIndustriesHandler, getAllSkillsHandler, getAllUniversitiesHandler, getVerifiableSkillsHandler } from './utils.controller';

const router = Router();

// Public route to get all industries
// GET /api/utils/industries
router.get('/industries', getAllIndustriesHandler)
router.get('/universities', getAllUniversitiesHandler);
router.get('/courses', getAllCoursesHandler);
router.get('/degrees', getAllDegreesHandler);
router.get('/skills', getAllSkillsHandler);
router.get('/verifiable-skills', getVerifiableSkillsHandler);

export default router;