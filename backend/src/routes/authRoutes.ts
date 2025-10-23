import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { registerValidation, loginValidation } from '../middleware/validator';
import { authenticate } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Регистрация
router.post('/register', registerValidation, authController.register);

// Вход
router.post('/login', loginValidation, authController.login);

// Авторизация через Telegram
router.post('/telegram', authController.telegramAuth);

// Привязка Telegram аккаунта (требует авторизации)
router.post('/link-telegram', authenticate, authController.linkTelegram);

export default router;
