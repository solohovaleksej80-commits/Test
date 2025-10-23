import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/authService';
import { RegisterDTO, LoginDTO, AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { parseTelegramInitData, verifyTelegramWebAppData } from '../utils/telegram';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(
          errors.array().map(e => e.msg).join(', '),
          400
        );
      }

      const data: RegisterDTO = req.body;
      const result = await authService.register(data);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(
          errors.array().map(e => e.msg).join(', '),
          400
        );
      }

      const data: LoginDTO = req.body;
      const result = await authService.login(data);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async telegramAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { initData } = req.body;

      if (!initData) {
        throw new AppError('Отсутствуют данные Telegram', 400);
      }

      // Проверяем подлинность данных
      const isValid = verifyTelegramWebAppData(initData);
      if (!isValid) {
        throw new AppError('Неверные данные Telegram', 401);
      }

      // Парсим данные пользователя
      const telegramUser = parseTelegramInitData(initData);
      if (!telegramUser) {
        throw new AppError('Не удалось получить данные пользователя', 400);
      }

      // TODO: Реализовать логику авторизации/регистрации через Telegram
      // Для MVP можно вернуть заглушку или использовать email/password

      res.json({
        message: 'Telegram авторизация в разработке',
        user: telegramUser
      });
    } catch (error) {
      next(error);
    }
  }

  async linkTelegram(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { initData } = req.body;
      const userId = req.userId!;

      if (!initData) {
        throw new AppError('Отсутствуют данные Telegram', 400);
      }

      const isValid = verifyTelegramWebAppData(initData);
      if (!isValid) {
        throw new AppError('Неверные данные Telegram', 401);
      }

      const telegramUser = parseTelegramInitData(initData);
      if (!telegramUser) {
        throw new AppError('Не удалось получить данные пользователя', 400);
      }

      await authService.linkTelegram(
        userId,
        telegramUser.id.toString(),
        telegramUser.username
      );

      res.json({
        success: true,
        message: 'Telegram аккаунт успешно привязан'
      });
    } catch (error) {
      next(error);
    }
  }
}
