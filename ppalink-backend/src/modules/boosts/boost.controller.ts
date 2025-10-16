import type { NextFunction, Response, Request } from 'express';
import type { AuthRequest } from '../../middleware/auth';
import { createBoostCheckoutSession, getPublicBoostTiers } from './boost.service';

/**
 * Handler for an agency to create a Stripe Checkout session for boosting a post.
 */
export async function createBoostCheckoutSessionHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).send();
  try {
    const { feedItemId, tierName } = req.body; // Expecting 'STANDARD' or 'PREMIUM'

    if (!feedItemId || !tierName) {
      return res.status(400).json({ success: false, message: 'feedItemId and tierName are required.' });
    }
    if (tierName !== 'STANDARD' && tierName !== 'PREMIUM') {
      return res.status(400).json({ success: false, message: 'Invalid tierName specified.' });
    }

    const { url } = await createBoostCheckoutSession(
        req.user.id,
        req.user.email,
        feedItemId,
        tierName
    );

    res.status(200).json({ success: true, data: { url } });
  } catch (error: any) {
      if (error.message.includes('permission')) {
          return res.status(403).json({ success: false, message: error.message });
      }
    next(error);
  }
}

export async function getPublicBoostTiersHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const tiers = await getPublicBoostTiers();
        res.status(200).json({ success: true, data: tiers });
    } catch (error) {
        next(error);
    }
}