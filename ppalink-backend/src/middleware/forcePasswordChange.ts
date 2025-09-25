import type { NextFunction, Response } from 'express';
import type { AuthRequest } from './auth';

/**
 * Middleware to check if a user is required to change their password.
 * This should be placed on protected routes after the `authenticate` middleware.
 */
export const forcePasswordChange = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.passwordResetRequired) {
    // We allow access ONLY to the password change endpoint
    if (req.path.endsWith('/change-password')) {
      return next();
    }
    // For all other endpoints, we deny access
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You must change your temporary password before proceeding.',
      code: 'PASSWORD_RESET_REQUIRED', // A special code for the frontend to identify this error
    });
  }
  // If no password change is needed, proceed to the next middleware
  return next();
};