import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { RegisterDTO, LoginDTO, AuthResponse } from '../types';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class AuthService {
  async register(data: RegisterDTO): Promise<AuthResponse> {
    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new AppError('Пользователь с таким email уже существует', 400);
    }

    // Хэшируем пароль
    const hashedPassword = await hashPassword(data.password);

    // Создаем пользователя и профиль в транзакции
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        telegramUsername: data.telegramUsername,
        profile: {
          create: {
            tokens: parseInt(process.env.INITIAL_TOKENS || '500')
          }
        }
      },
      include: {
        profile: true
      }
    });

    // Обрабатываем реферальный код, если есть
    if (data.referralCode) {
      await this.handleReferral(user.id, data.referralCode);
    }

    // Создаем начальное задание "Добро пожаловать"
    const welcomeQuest = await prisma.quest.findFirst({
      where: { title: 'Добро пожаловать!' }
    });

    if (welcomeQuest && user.profile) {
      await prisma.playerQuest.create({
        data: {
          profileId: user.profile.id,
          questId: welcomeQuest.id,
          progress: JSON.stringify({ registered: true }),
          isCompleted: true,
          completedAt: new Date()
        }
      });
    }

    // Генерируем токен
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        telegramUsername: user.telegramUsername || undefined
      },
      profile: {
        level: user.profile?.level || 1,
        experience: user.profile?.experience || 0,
        tokens: user.profile?.tokens || 0
      }
    };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    // Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { profile: true }
    });

    if (!user) {
      throw new AppError('Неверный email или пароль', 401);
    }

    // Проверяем пароль
    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Неверный email или пароль', 401);
    }

    // Обновляем время последнего входа
    if (user.profile) {
      await prisma.playerProfile.update({
        where: { id: user.profile.id },
        data: { lastLogin: new Date() }
      });
    }

    // Генерируем токен
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        telegramUsername: user.telegramUsername || undefined
      },
      profile: {
        level: user.profile?.level || 1,
        experience: user.profile?.experience || 0,
        tokens: user.profile?.tokens || 0
      }
    };
  }

  async linkTelegram(
    userId: string,
    telegramId: string,
    telegramUsername?: string
  ): Promise<void> {
    // Проверяем, не привязан ли уже этот Telegram ID
    const existingUser = await prisma.user.findUnique({
      where: { telegramId }
    });

    if (existingUser && existingUser.id !== userId) {
      throw new AppError('Этот Telegram аккаунт уже привязан к другому пользователю', 400);
    }

    // Привязываем Telegram к пользователю
    await prisma.user.update({
      where: { id: userId },
      data: {
        telegramId,
        telegramUsername
      }
    });
  }

  private async handleReferral(userId: string, referralCode: string): Promise<void> {
    try {
      // Убираем префикс "ref_" если есть
      const username = referralCode.replace('ref_', '');

      // Ищем реферера по username
      const referrer = await prisma.user.findFirst({
        where: { telegramUsername: username },
        include: { profile: true }
      });

      if (!referrer || !referrer.profile) {
        return; // Не бросаем ошибку, просто игнорируем
      }

      // Проверяем, что пользователь не приглашает сам себя
      if (referrer.id === userId) {
        return;
      }

      // Создаем реферальную связь
      await prisma.referral.create({
        data: {
          referrerId: referrer.id,
          refereeId: userId
        }
      });

      // Награды за реферала
      const referrerReward = parseInt(process.env.REFERRAL_REWARD || '100');
      const refereeReward = parseInt(process.env.REFEREE_REWARD || '50');

      // Награда приглашающему
      await prisma.playerProfile.update({
        where: { id: referrer.profile.id },
        data: {
          tokens: { increment: referrerReward }
        }
      });

      // Награда приглашенному
      const refereeProfile = await prisma.playerProfile.findFirst({
        where: { userId }
      });

      if (refereeProfile) {
        await prisma.playerProfile.update({
          where: { id: refereeProfile.id },
          data: {
            tokens: { increment: refereeReward }
          }
        });
      }

      // Записываем транзакции
      await prisma.transaction.createMany({
        data: [
          {
            profileId: referrer.profile.id,
            type: 'earn',
            source: 'referral',
            amount: referrerReward,
            balanceBefore: referrer.profile.tokens,
            balanceAfter: referrer.profile.tokens + referrerReward,
            description: `Награда за приглашение друга @${username}`
          }
        ]
      });
    } catch (error) {
      console.error('Ошибка обработки реферала:', error);
      // Не бросаем ошибку, чтобы не прервать регистрацию
    }
  }
}
