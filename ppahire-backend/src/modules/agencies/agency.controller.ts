import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { checkAgencyMembership, getAgencyById, updateAgencyProfile } from './agency.service';
import { UpdateAgencyProfileInput } from './agency.types';

export async function getAgencyProfileHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { agencyId } = req.params;
    // Any authenticated user can view an agency profile, so no membership check here.
    const agency = await getAgencyById(agencyId);
    return res.status(200).json({ success: true, data: agency });
  } catch (error) {
    next(error);
  }
}

export async function updateAgencyProfileHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { agencyId } = req.params;
    const userId = req.user!.id;
    const data: UpdateAgencyProfileInput = req.body;

    // Security Check: Ensure user is an Owner or Manager
    await checkAgencyMembership(userId, agencyId);

    const updatedAgency = await updateAgencyProfile(agencyId, data);
    return res.status(200).json({
      success: true,
      message: 'Agency profile updated successfully',
      data: updatedAgency,
    });
  } catch (error: any) {
    if (error.message.includes('Forbidden')) {
        return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
}