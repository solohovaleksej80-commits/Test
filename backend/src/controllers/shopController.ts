import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ShopService } from '../services/shopService';
import { AuthRequest, PurchaseDTO } from '../types';
import { AppError } from '../middleware/errorHandler';

const shopService = new ShopService();

export class ShopController {
  async getItems(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const items = await shopService.getShopItems(userId);

      res.json(items);
    } catch (error) {
      next(error);
    }
  }

  async purchase(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(
          errors.array().map(e => e.msg).join(', '),
          400
        );
      }

      const userId = req.userId!;
      const data: PurchaseDTO = req.body;

      const result = await shopService.purchaseItem(userId, data);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
