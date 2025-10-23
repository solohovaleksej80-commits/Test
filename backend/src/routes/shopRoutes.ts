import { Router } from 'express';
import { ShopController } from '../controllers/shopController';
import { purchaseValidation } from '../middleware/validator';
import { authenticate } from '../middleware/auth';

const router = Router();
const shopController = new ShopController();

// Все маршруты требуют авторизации
router.use(authenticate);

// Получить товары в магазине
router.get('/items', shopController.getItems);

// Купить товар
router.post('/buy', purchaseValidation, shopController.purchase);

export default router;
