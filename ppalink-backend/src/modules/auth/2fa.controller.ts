import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../../middleware/auth';
import { generateTwoFactorSecret, verifyAndEnableTwoFactor, disableTwoFactor } from './2fa.service';

/**
 * Handler for generating a new 2FA secret and QR code.
 */
export async function generate2faSecretHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).send();
  try {
    const { qrCodeDataUrl } = await generateTwoFactorSecret(req.user.id, req.user.email);
    res.status(200).json({ success: true, data: { qrCodeDataUrl } });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler for verifying a 2FA token and enabling the feature.
 */
export async function enable2faHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).send();
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: '2FA token is required.' });
    
    await verifyAndEnableTwoFactor(req.user.id, token);
    res.status(200).json({ success: true, message: '2FA has been enabled successfully.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * Handler for disabling the 2FA feature.
 */
export async function disable2faHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).send();
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'A valid 2FA token is required to disable this feature.' });
    
    await disableTwoFactor(req.user.id, token);
    res.status(200).json({ success: true, message: '2FA has been disabled successfully.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}