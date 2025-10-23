import { Response, NextFunction } from 'express';
import { ReferralService } from '../services/referralService';
import { AuthRequest } from '../types';

const referralService = new ReferralService();

export class ReferralController {
  async getLink(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const link = await referralService.getReferralLink(userId);

      res.json({ link });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const stats = await referralService.getReferralStats(userId);

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getReferrals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const referrals = await referralService.getReferrals(userId);

      res.json({ referrals });
    } catch (error) {
      next(error);
    }
  }
}
