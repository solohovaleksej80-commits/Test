import { Response, NextFunction } from 'express';
import { QuestService } from '../services/questService';
import { AuthRequest } from '../types';

const questService = new QuestService();

export class QuestController {
  async getQuests(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const quests = await questService.getPlayerQuests(userId);

      res.json(quests);
    } catch (error) {
      next(error);
    }
  }

  async claimReward(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { questId } = req.params;

      const result = await questService.claimQuestReward(userId, questId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
