import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { generateReferralLink } from '../utils/telegram';
import { ReferralStats } from '../types';

const prisma = new PrismaClient();

export class ReferralService {
  // Получить реферальную ссылку
  async getReferralLink(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('Пользователь не найден', 404);
    }

    if (!user.telegramUsername) {
      throw new AppError('Сначала привяжите Telegram аккаунт', 400);
    }

    return generateReferralLink(user.telegramUsername);
  }

  // Получить статистику рефералов
  async getReferralStats(userId: string): Promise<ReferralStats> {
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referee: {
          include: {
            profile: true
          }
        }
      }
    });

    const totalReferrals = referrals.length;

    // Считаем активными тех, кто достиг хотя бы 2 уровня
    const activeReferrals = referrals.filter(
      r => r.referee.profile && r.referee.profile.level >= 2
    ).length;

    // Считаем общий заработок
    const referralReward = parseInt(process.env.REFERRAL_REWARD || '100');
    const totalEarned = totalReferrals * referralReward;

    const referralsList = referrals.map(r => ({
      username: r.referee.telegramUsername || r.referee.email,
      joinedAt: r.createdAt,
      isActive: r.referee.profile ? r.referee.profile.level >= 2 : false
    }));

    return {
      totalReferrals,
      activeReferrals,
      totalEarned,
      referrals: referralsList
    };
  }

  // Получить список рефералов
  async getReferrals(userId: string) {
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referee: {
          select: {
            email: true,
            telegramUsername: true,
            createdAt: true,
            profile: {
              select: {
                level: true,
                tokens: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return referrals.map(r => ({
      id: r.id,
      username: r.referee.telegramUsername || r.referee.email.split('@')[0],
      level: r.referee.profile?.level || 1,
      tokens: r.referee.profile?.tokens || 0,
      joinedAt: r.createdAt,
      rewardClaimed: r.rewardClaimed
    }));
  }
}
