import type { NextFunction, Request, Response } from 'express';
import type { AuthRequest } from '../../middleware/auth';
import { getAgencyByUserId } from '../agencies/agency.service';
import { finalizeDomainVerification, initiateDomainVerification } from './domain.service';

// Handler for the agency to start the verification process (this one is correct)
export async function initiateDomainVerificationHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ success: false, message: 'Domain is required.' });
    
    const agency = await getAgencyByUserId(req.user.id);
    const result = await initiateDomainVerification(agency.id, domain, req.user.email);
    
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function finalizeDomainVerificationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // It correctly reads the token from the request BODY of a POST request.
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Token is required.' });

    await finalizeDomainVerification(token);
    // It returns a JSON success message to the frontend that called it. It DOES NOT redirect.
    res.status(200).json({ success: true, message: 'Domain verified successfully!' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}