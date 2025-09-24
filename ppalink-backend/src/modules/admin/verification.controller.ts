import type { NextFunction, Request, Response } from 'express';
import {
  forceVerifyEmail,
  forceVerifyNysc,
  forceVerifyDomain,
  forceVerifyCac,
} from './verification.service';

// A generic handler to reduce code duplication
const createForceVerifyHandler = (serviceFunction: (userId: string) => Promise<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      await serviceFunction(userId);
      res.status(200).json({ success: true, message: 'Verification status updated successfully.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

export const forceVerifyEmailHandler = createForceVerifyHandler(forceVerifyEmail);
export const forceVerifyNyscHandler = createForceVerifyHandler(forceVerifyNysc);
export const forceVerifyDomainHandler = createForceVerifyHandler(forceVerifyDomain);
export const forceVerifyCacHandler = createForceVerifyHandler(forceVerifyCac);