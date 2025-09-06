import type { NextFunction, Request, Response } from 'express';
import * as utilsService from './utils.service';

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