import { NextFunction, Request, Response } from 'express';
import { login, registerAgency, registerCandidate } from './auth.service';
import { LoginInput, RegisterAgencyInput, RegisterCandidateInput } from './auth.types';

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


export async function loginHandler(
    req: Request<{}, {}, LoginInput>,
    res: Response,
    next: NextFunction
) {
    try {
        const { user, token } = await login(req.body);
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: { user, token },
        });
    } catch (error: any) {
        // For login, always return a generic error message for security
        if (error.message.includes('Invalid')) {
             return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        next(error);
    }
}