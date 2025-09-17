import type { NextFunction, Request, Response } from 'express';
import type { AuthRequest } from '../../middleware/auth';
import { getAgencyByUserId } from '../agencies/agency.service';
import { acceptInvitation, deleteInvitation, sendInvitation, verifyInvitationToken } from './invitation.service';

/**
 * Handler for an agency owner/admin to send a new team member invitation.
 */
export async function sendInvitationHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    // Get the agency associated with the user sending the invite
    const agency = await getAgencyByUserId(req.user.id);

    const invitation = await sendInvitation({
      agencyId: agency.id,
      inviterId: req.user.id,
      inviteeEmail: email,
    });

    return res.status(201).json({
      success: true,
      message: `Invitation sent to ${email}.`,
      data: invitation,
    });
  } catch (error: any) {
    if (error.message.includes('plan is limited')) {
      return res.status(403).json({ success: false, message: error.message });
    }
     if (error.code === 'P2002') { // Prisma unique constraint violation
      return res.status(409).json({ success: false, message: 'An invitation for this email address already exists.' });
    }
    next(error);
  }
}

/**
 * Handler to verify an invitation token.
 */
export async function verifyInvitationTokenHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const data = await verifyInvitationToken(token);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
  
  /**
   * Handler for a new user to accept an invitation by signing up.
   */
  export async function acceptInvitationSignUpHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, firstName, lastName, password } = req.body;
      // ... validation
      const newUser = await acceptInvitation({ token, firstName, lastName, password });
      res.status(201).json({ success: true, message: 'Account created successfully! You can now log in.', data: newUser });
    } catch (error: any) { /* ... error handling ... */ }
  }
  
    /**
     * Handler for an existing logged-in user to accept an invitation.
     */
  export async function acceptInvitationLoggedInHandler(req: AuthRequest, res: Response, next: NextFunction) {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      try {
          const { token } = req.body;
          if (!token) return res.status(400).json({ success: false, message: 'Invitation token is required.' });
  
          await acceptInvitation({ token, existingUserId: req.user.id });
          res.status(200).json({ success: true, message: 'Invitation accepted successfully!' });
      } catch (error: any) {
          res.status(400).json({ success: false, message: error.message });
      }
  }

  /**
 * Handler for an agency owner/admin to delete/revoke a pending invitation.
 */
export async function deleteInvitationHandler(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    try {
      const { invitationId } = req.params;
      await deleteInvitation(invitationId, req.user.id);
      res.status(204).send(); // 204 No Content for successful deletion
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }