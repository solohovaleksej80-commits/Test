import { Router } from 'express';
import { ReferralController } from '../controllers/referralController';
import { authenticate } from '../middleware/auth';

const router = Router();
const referralController = new ReferralController();

// Все маршруты требуют авторизации
router.use(authenticate);

// Получить реферальную ссылку
router.get('/link', referralController.getLink);

// Получить статистику рефералов
router.get('/stats', referralController.getStats);

// Получить список рефералов
router.get('/list', referralController.getReferrals);

export default router;
