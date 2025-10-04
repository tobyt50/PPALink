import { NextFunction, Request, Response } from 'express';
import { getUserProfile, login, registerAgency, registerCandidate } from './auth.service';
import { LoginInput, RegisterAgencyInput, RegisterCandidateInput } from './auth.types';
import { AuthRequest } from '../../middleware/auth';
import { changeUserPassword } from './auth.service';

export async function registerCandidateHandler(
  req: Request<{}, {}, RegisterCandidateInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await registerCandidate(req.body);
    return res.status(201).json({
      success: true,
      message: 'Candidate registered successfully',
      data: user,
    });
  } catch (error: any) {
    // Handle specific error for duplicate user
    if (error.message.includes('already exists')) {
        return res.status(409).json({ success: false, message: error.message });
    }
    next(error); // Pass other errors to the global error handler
  }
}

export async function registerAgencyHandler(
  req: Request<{}, {}, RegisterAgencyInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const { owner, agency } = await registerAgency(req.body);
    return res.status(201).json({
      success: true,
      message: 'Agency registered successfully',
      data: { owner, agency },
    });
  } catch (error: any) {
     if (error.message.includes('already exists')) {
        return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
}


export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. The result from the service has a varying shape.
    const result = await login(req.body as LoginInput);

    // 2. Check for the 2FA required flag.
    if ((result as any).twoFactorRequired) {
      // If it exists, send the specific 2FA response shape.
      return res.status(200).json({ success: true, twoFactorRequired: true });
    }

    // 3. If the flag is NOT present, it means a full, successful login occurred.
    // We must wrap the result in the standard AuthResponse envelope.
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result, // result is { user, token }
    });

  } catch (error) {
    // Errors like "Invalid password" or "Invalid 2FA token" are caught here.
    next(error);
  }
}

export async function changePasswordHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).send();
  try {
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ success: false, message: 'New password is required.' });

    await changeUserPassword(req.user.id, newPassword);
    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) { next(error); }
}

/**
 * Handler for fetching the full profile of the currently authenticated user.
 * It uses the ID from the JWT, not a URL parameter.
 */
export async function getMyProfileHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    const userProfile = await getUserProfile(req.user.id);
    res.status(200).json({ success: true, data: userProfile });
  } catch (error) {
    next(error);
  }
}