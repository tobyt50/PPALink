import { Router } from 'express';
import { validate } from '../../middleware/validate'; // 1. Import the validate middleware
import * as experienceController from './experience.controller';
import { educationSchema, updateEducationSchema, updateWorkExperienceSchema, workExperienceSchema } from './experience.types'; // 2. Import the schemas

const router = Router();

// --- Work Experience Routes ---
router.post('/experience', validate(workExperienceSchema), experienceController.addWorkExperienceHandler);
router.patch('/experience/:experienceId', validate(updateWorkExperienceSchema), experienceController.updateWorkExperienceHandler);
router.delete('/experience/:experienceId', experienceController.deleteWorkExperienceHandler);


// --- Education Routes ---
router.post('/education', validate(educationSchema), experienceController.addEducationHandler);
router.patch('/education/:educationId', validate(updateEducationSchema), experienceController.updateEducationHandler);
router.delete('/education/:educationId', experienceController.deleteEducationHandler);


export default router;