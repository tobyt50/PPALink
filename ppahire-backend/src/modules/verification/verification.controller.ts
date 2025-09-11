import { VerificationStatus, VerificationType } from '@prisma/client';
import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../../middleware/auth';
import { createVerificationSubmission, getPendingVerifications, updateVerificationStatus } from './verification.service';

/**
 * Handler to get all pending verification requests.
 */
export async function getPendingVerificationsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const verifications = await getPendingVerifications();
    return res.status(200).json({ success: true, data: verifications });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler to update the status of a verification request.
 */
export async function updateVerificationStatusHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    // This check is redundant due to middleware but good for type safety
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { verificationId } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(VerificationStatus).includes(status)) {
      return res.status(400).json({ success: false, message: 'A valid status is required.' });
    }

    const updatedVerification = await updateVerificationStatus(verificationId, status, req.user.id);

    return res.status(200).json({
      success: true,
      message: `Verification status updated to ${status}.`,
      data: updatedVerification,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler for a user to submit a new verification request.
 */
export async function createVerificationSubmissionHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const { type, evidence } = req.body;

    // Validate input
    if (!type || !Object.values(VerificationType).includes(type)) {
      return res.status(400).json({ success: false, message: 'A valid verification type is required.' });
    }
    if (!evidence || !evidence.fileKey || !evidence.fileName) {
      return res.status(400).json({ success: false, message: 'Evidence with fileKey and fileName is required.' });
    }

    const submission = await createVerificationSubmission(req.user.id, type, evidence);

    return res.status(201).json({
      success: true,
      message: 'Verification request submitted successfully.',
      data: submission,
    });
  } catch (error: any) {
    if (error.message.includes('already have a pending')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
}