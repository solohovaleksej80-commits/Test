import { Router } from 'express';
import { QuestController } from '../controllers/questController';
import { authenticate } from '../middleware/auth';

const router = Router();
const questController = new QuestController();

// Все маршруты требуют авторизации
router.use(authenticate);

// Получить задания игрока
router.get('/', questController.getQuests);

// Получить награду за задание
router.post('/:questId/claim', questController.claimReward);

export default router;
