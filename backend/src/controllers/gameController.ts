import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { GameService } from '../services/gameService';
import { AuthRequest, PlaceEquipmentDTO } from '../types';
import { AppError } from '../middleware/errorHandler';

const gameService = new GameService();

export class GameController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const profile = await gameService.getPlayerProfile(userId);

      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  async getFarm(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const farm = await gameService.getPlayerFarm(userId);

      res.json(farm);
    } catch (error) {
      next(error);
    }
  }

  async placeEquipment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(
          errors.array().map(e => e.msg).join(', '),
          400
        );
      }

      const userId = req.userId!;
      const data: PlaceEquipmentDTO = req.body;

      const equipment = await gameService.placeEquipment(userId, data);

      res.status(201).json(equipment);
    } catch (error) {
      next(error);
    }
  }

  async collectResources(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { equipmentId } = req.params;

      const result = await gameService.collectResources(userId, equipmentId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async collectAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const result = await gameService.collectAll(userId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async removeEquipment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { equipmentId } = req.params;

      const result = await gameService.removeEquipment(userId, equipmentId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
