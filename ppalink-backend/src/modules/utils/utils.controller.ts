import type { NextFunction, Request, Response } from 'express';
import * as utilsService from './utils.service';
import { getLgasByStateId } from './utils.service';

/**
 * Handler to get all industries.
 */
export async function getAllIndustriesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const industries = await utilsService.getAllIndustries();
    return res.status(200).json({ success: true, data: industries });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler to get all location states.
 */
export async function getAllLocationStatesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const states = await utilsService.getAllLocationStates();
    return res.status(200).json({ success: true, data: states });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler to get all LGAs for a specific state.
 */
export async function getLgasByStateIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const stateId = parseInt(req.params.stateId, 10);
    if (isNaN(stateId)) {
      return res.status(400).json({ success: false, message: 'A valid state ID is required.' });
    }
    const lgas = await getLgasByStateId(stateId);
    return res.status(200).json({ success: true, data: lgas });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler to get all universities (institutions).
 */
export async function getAllUniversitiesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const universities = await utilsService.getAllUniversities();
    return res.status(200).json({ success: true, data: universities });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler to get all courses of study (fields).
 */
export async function getAllCoursesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const courses = await utilsService.getAllCourses();
    return res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler to get all degrees.
 */
export async function getAllDegreesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const degrees = await utilsService.getAllDegrees();
    return res.status(200).json({ success: true, data: degrees });
  } catch (error) {
    next(error);
  }
}

export async function getAllSkillsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const skills = await utilsService.getAllSkills();
    res.status(200).json({ success: true, data: skills });
  } catch (error) {
    next(error);
  }
}

export async function getVerifiableSkillsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const skills = await utilsService.getVerifiableSkills();
    res.status(200).json({ success: true, data: skills });
  } catch (error) {
    next(error);
  }
}