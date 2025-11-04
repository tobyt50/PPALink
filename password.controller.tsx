import type { NextFunction, Request, Response } from 'express';
import { resetPassword, sendPasswordResetEmail } from './password.service';

/**
 * Handler to request a password reset link.
 */
export async function requestPasswordResetHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    await sendPasswordResetEmail(email);
    // Always return a success message to prevent user enumeration attacks
    return res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler to perform the password reset.
 */
export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }
    await resetPassword(token, password);
    return res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error: any) {
    // Handle specific token errors
    if (error.message.includes('Invalid or expired')) {
        return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
}