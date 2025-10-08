import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../../middleware/auth';
import { getAgencyByUserId } from '../agencies/agency.service';
import { getMyCandidateProfile } from '../candidates/candidate.service';
import { createOffer, respondToOffer } from './offer.service';

/**
 * Handler for an agency to create and extend a job offer.
 */
export async function createOfferHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).send();
  try {
    const { applicationId } = req.params;
    const { salary, startDate } = req.body;
    
    const agency = await getAgencyByUserId(req.user.id);
    
    const offer = await createOffer({
        applicationId,
        agencyId: agency.id,
        salary,
        startDate
    });

    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler for a candidate to respond to a job offer.
 */
export async function respondToOfferHandler(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.user) return res.status(401).send();
    try {
        const { offerId } = req.params;
        const { response } = req.body; // "ACCEPTED" or "DECLINED"

        if (response !== 'ACCEPTED' && response !== 'DECLINED') {
            return res.status(400).json({ success: false, message: 'Invalid response provided.' });
        }

        const profile = await getMyCandidateProfile(req.user.id);
        const updatedOffer = await respondToOffer(offerId, profile.id, response);

        res.status(200).json({ success: true, data: updatedOffer });
    } catch (error) {
        next(error);
    }
}