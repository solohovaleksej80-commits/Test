import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class QuestService {
  // Получить все задания игрока
  async getPlayerQuests(userId: string) {
    const profile = await prisma.playerProfile.findFirst({
      where: { userId },
      include: {
        quests: {
          include: {
            quest: true
          }
        }
      }
    });

    if (!profile) {
      throw new AppError('Профиль игрока не найден', 404);
    }

    // Получаем доступные задания
    const availableQuests = await prisma.quest.findMany({
      where: {
        isActive: true,
        requiredLevel: {
          lte: profile.level
        }
      },
      orderBy: [
        { order: 'asc' }
      ]
    });

    // Формируем список заданий с прогрессом
    const quests = availableQuests.map(quest => {
      const playerQuest = profile.quests.find(pq => pq.questId === quest.id);

      return {
        id: quest.id,
        title: quest.title,
        description: quest.description,
        type: quest.type,
        rewardTokens: quest.rewardTokens,
        rewardEquipment: quest.rewardEquipment,
        requirement: JSON.parse(quest.requirement),
        progress: playerQuest ? JSON.parse(playerQuest.progress) : {},
        isCompleted: playerQuest?.isCompleted || false,
        isClaimed: playerQuest?.isClaimed || false,
        completedAt: playerQuest?.completedAt,
        claimedAt: playerQuest?.claimedAt
      };
    });

    return {
      tutorial: quests.filter(q => q.type === 'tutorial'),
      daily: quests.filter(q => q.type === 'daily'),
      weekly: quests.filter(q => q.type === 'weekly'),
      achievements: quests.filter(q => q.type === 'achievement')
    };
  }

  // Получить награду за задание
  async claimQuestReward(userId: string, questId: string) {
    const profile = await prisma.playerProfile.findFirst({
      where: { userId }
    });

    if (!profile) {
      throw new AppError('Профиль игрока не найден', 404);
    }

    const quest = await prisma.quest.findUnique({
      where: { id: questId }
    });

    if (!quest) {
      throw new AppError('Задание не найдено', 404);
    }

    const playerQuest = await prisma.playerQuest.findFirst({
      where: {
        profileId: profile.id,
        questId: questId
      }
    });

    if (!playerQuest) {
      throw new AppError('Вы еще не начали это задание', 400);
    }

    if (!playerQuest.isCompleted) {
      throw new AppError('Задание еще не выполнено', 400);
    }

    if (playerQuest.isClaimed) {
      throw new AppError('Награда уже получена', 400);
    }

    // Выдаем награду в транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Обновляем задание
      await tx.playerQuest.update({
        where: { id: playerQuest.id },
        data: {
          isClaimed: true,
          claimedAt: new Date()
        }
      });

      // Добавляем токены
      const updatedProfile = await tx.playerProfile.update({
        where: { id: profile.id },
        data: {
          tokens: { increment: quest.rewardTokens }
        }
      });

      // Записываем транзакцию
      await tx.transaction.create({
        data: {
          profileId: profile.id,
          type: 'earn',
          source: 'quest',
          amount: quest.rewardTokens,
          balanceBefore: profile.tokens,
          balanceAfter: updatedProfile.tokens,
          description: `Награда за задание: ${quest.title}`,
          metadata: JSON.stringify({ questId: quest.id })
        }
      });

      return {
        tokens: quest.rewardTokens,
        newBalance: updatedProfile.tokens,
        rewardEquipment: quest.rewardEquipment
      };
    });

    return result;
  }

  // Проверить прогресс задания
  async updateQuestProgress(
    profileId: string,
    questType: string,
    progressData: any
  ) {
    const quest = await prisma.quest.findFirst({
      where: {
        type: questType,
        isActive: true
      }
    });

    if (!quest) return;

    const requirement = JSON.parse(quest.requirement);
    let playerQuest = await prisma.playerQuest.findFirst({
      where: {
        profileId,
        questId: quest.id
      }
    });

    if (!playerQuest) {
      // Создаем новое задание
      playerQuest = await prisma.playerQuest.create({
        data: {
          profileId,
          questId: quest.id,
          progress: JSON.stringify(progressData)
        }
      });
    }

    // Проверяем выполнение
    const currentProgress = JSON.parse(playerQuest.progress);
    const isCompleted = this.checkQuestCompletion(requirement, currentProgress);

    if (isCompleted && !playerQuest.isCompleted) {
      await prisma.playerQuest.update({
        where: { id: playerQuest.id },
        data: {
          isCompleted: true,
          completedAt: new Date()
        }
      });
    }
  }

  private checkQuestCompletion(requirement: any, progress: any): boolean {
    switch (requirement.type) {
      case 'register':
        return progress.registered === true;
      case 'place_equipment':
        return (progress.place_equipment || 0) >= (requirement.count || 1);
      case 'collect_resources':
        return (progress.collect_resources || 0) >= (requirement.count || 1);
      case 'buy_equipment':
        return (progress.buy_equipment || 0) >= (requirement.count || 1);
      case 'invite_friend':
        return (progress.invite_friend || 0) >= (requirement.count || 1);
      case 'daily_login':
        return progress.daily_login === true;
      case 'reach_level':
        return (progress.level || 0) >= (requirement.level || 1);
      default:
        return false;
    }
  }
}
