import type { NextFunction, Request, Response } from 'express';
import {
  getAllSettings,
  updateSettings,
  getAllFeatureFlags,
  updateFeatureFlag,
} from './settings.service';

export async function getAllSettingsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await getAllSettings();
    res.status(200).json({ success: true, data: settings });
  } catch (error) { next(error); }
}

export async function updateSettingsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // req.body is expected to be an array of settings
    const updatedSettings = await updateSettings(req.body);
    res.status(200).json({ success: true, data: updatedSettings });
  } catch (error) { next(error); }
}

export async function getAllFeatureFlagsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const flags = await getAllFeatureFlags();
    res.status(200).json({ success: true, data: flags });
  } catch (error) { next(error); }
}

export async function updateFeatureFlagHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { flagName } = req.params;
    const { isEnabled } = req.body;
    if (typeof isEnabled !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isEnabled must be a boolean.' });
    }
    const updatedFlag = await updateFeatureFlag(flagName, isEnabled);
    res.status(200).json({ success: true, data: updatedFlag });
  } catch (error) { next(error); }
}