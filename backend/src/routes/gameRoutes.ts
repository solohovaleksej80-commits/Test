import { Router } from 'express';
import { GameController } from '../controllers/gameController';
import { placeEquipmentValidation } from '../middleware/validator';
import { authenticate } from '../middleware/auth';

const router = Router();
const gameController = new GameController();

// Все маршруты требуют авторизации
router.use(authenticate);

// Получить профиль игрока
router.get('/profile', gameController.getProfile);

// Получить ферму игрока
router.get('/farm', gameController.getFarm);

// Разместить оборудование
router.post('/equipment', placeEquipmentValidation, gameController.placeEquipment);

// Собрать ресурсы с оборудования
router.post('/equipment/:equipmentId/collect', gameController.collectResources);

// Собрать со всего оборудования
router.post('/collect-all', gameController.collectAll);

// Удалить оборудование
router.delete('/equipment/:equipmentId', gameController.removeEquipment);

export default router;
