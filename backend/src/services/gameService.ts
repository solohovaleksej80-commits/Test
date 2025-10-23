import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { PlaceEquipmentDTO } from '../types';

const prisma = new PrismaClient();

export class GameService {
  // Получить профиль игрока
  async getPlayerProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true
      }
    });

    if (!user || !user.profile) {
      throw new AppError('Профиль игрока не найден', 404);
    }

    return {
      id: user.profile.id,
      level: user.profile.level,
      experience: user.profile.experience,
      tokens: user.profile.tokens,
      farmWidth: user.profile.farmWidth,
      farmHeight: user.profile.farmHeight,
      lastLogin: user.profile.lastLogin,
      email: user.email,
      telegramUsername: user.telegramUsername
    };
  }

  // Получить ферму игрока (все оборудование)
  async getPlayerFarm(userId: string) {
    const profile = await prisma.playerProfile.findFirst({
      where: { userId },
      include: {
        equipment: {
          include: {
            template: true
          }
        }
      }
    });

    if (!profile) {
      throw new AppError('Профиль игрока не найден', 404);
    }

    // Рассчитываем накопленные ресурсы для каждого оборудования
    const equipmentWithProduction = profile.equipment.map(eq => {
      const hoursPassed = (Date.now() - eq.lastCollectedAt.getTime()) / (1000 * 60 * 60);
      const produced = Math.floor(hoursPassed * eq.template.productionRate);
      const available = Math.min(produced + eq.currentStorage, eq.template.storageCapacity);

      return {
        id: eq.id,
        templateId: eq.templateId,
        name: eq.template.name,
        description: eq.template.description,
        category: eq.template.category,
        rarity: eq.template.rarity,
        positionX: eq.positionX,
        positionY: eq.positionY,
        level: eq.level,
        width: eq.template.width,
        height: eq.template.height,
        productionRate: eq.template.productionRate,
        storageCapacity: eq.template.storageCapacity,
        currentStorage: available,
        imageUrl: eq.template.imageUrl,
        lastCollectedAt: eq.lastCollectedAt
      };
    });

    return {
      farmWidth: profile.farmWidth,
      farmHeight: profile.farmHeight,
      equipment: equipmentWithProduction
    };
  }

  // Разместить оборудование на ферме
  async placeEquipment(userId: string, data: PlaceEquipmentDTO) {
    const profile = await prisma.playerProfile.findFirst({
      where: { userId },
      include: { equipment: true }
    });

    if (!profile) {
      throw new AppError('Профиль игрока не найден', 404);
    }

    // Проверяем, существует ли шаблон
    const template = await prisma.equipmentTemplate.findUnique({
      where: { id: data.templateId }
    });

    if (!template) {
      throw new AppError('Шаблон оборудования не найден', 404);
    }

    // Проверяем, что позиция в пределах фермы
    if (
      data.positionX < 0 ||
      data.positionY < 0 ||
      data.positionX + template.width > profile.farmWidth ||
      data.positionY + template.height > profile.farmHeight
    ) {
      throw new AppError('Оборудование выходит за пределы фермы', 400);
    }

    // Проверяем, что клетки свободны
    const isOccupied = profile.equipment.some(eq => {
      const eqTemplate = eq.template as any;
      return this.checkCollision(
        data.positionX,
        data.positionY,
        template.width,
        template.height,
        eq.positionX,
        eq.positionY,
        eqTemplate?.width || 1,
        eqTemplate?.height || 1
      );
    });

    if (isOccupied) {
      throw new AppError('Эти клетки уже заняты', 400);
    }

    // Размещаем оборудование
    const equipment = await prisma.playerEquipment.create({
      data: {
        profileId: profile.id,
        templateId: data.templateId,
        positionX: data.positionX,
        positionY: data.positionY
      },
      include: {
        template: true
      }
    });

    // Проверяем задание "Первое оборудование"
    await this.checkQuestProgress(profile.id, 'place_equipment');

    return equipment;
  }

  // Собрать ресурсы с оборудования
  async collectResources(userId: string, equipmentId: string) {
    const profile = await prisma.playerProfile.findFirst({
      where: { userId }
    });

    if (!profile) {
      throw new AppError('Профиль игрока не найден', 404);
    }

    const equipment = await prisma.playerEquipment.findFirst({
      where: {
        id: equipmentId,
        profileId: profile.id
      },
      include: { template: true }
    });

    if (!equipment) {
      throw new AppError('Оборудование не найдено', 404);
    }

    // Рассчитываем накопленные ресурсы
    const hoursPassed = (Date.now() - equipment.lastCollectedAt.getTime()) / (1000 * 60 * 60);
    const produced = Math.floor(hoursPassed * equipment.template.productionRate);
    const available = Math.min(
      produced + equipment.currentStorage,
      equipment.template.storageCapacity
    );

    if (available <= 0) {
      throw new AppError('Нет ресурсов для сбора', 400);
    }

    // Обновляем профиль игрока и оборудование в транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Обновляем оборудование
      await tx.playerEquipment.update({
        where: { id: equipmentId },
        data: {
          currentStorage: 0,
          lastCollectedAt: new Date()
        }
      });

      // Обновляем баланс токенов
      const updatedProfile = await tx.playerProfile.update({
        where: { id: profile.id },
        data: {
          tokens: { increment: available }
        }
      });

      // Записываем транзакцию
      await tx.transaction.create({
        data: {
          profileId: profile.id,
          type: 'earn',
          source: 'production',
          amount: available,
          balanceBefore: profile.tokens,
          balanceAfter: updatedProfile.tokens,
          description: `Собрано с ${equipment.template.name}`
        }
      });

      return updatedProfile;
    });

    // Проверяем задание "Сбор урожая"
    await this.checkQuestProgress(profile.id, 'collect_resources');

    return {
      collected: available,
      newBalance: result.tokens
    };
  }

  // Удалить оборудование
  async removeEquipment(userId: string, equipmentId: string) {
    const profile = await prisma.playerProfile.findFirst({
      where: { userId }
    });

    if (!profile) {
      throw new AppError('Профиль игрока не найден', 404);
    }

    const equipment = await prisma.playerEquipment.findFirst({
      where: {
        id: equipmentId,
        profileId: profile.id
      },
      include: { template: true }
    });

    if (!equipment) {
      throw new AppError('Оборудование не найдено', 404);
    }

    // Возвращаем 50% стоимости
    const refund = Math.floor(equipment.template.price * 0.5);

    await prisma.$transaction(async (tx) => {
      // Удаляем оборудование
      await tx.playerEquipment.delete({
        where: { id: equipmentId }
      });

      // Возвращаем токены
      if (refund > 0) {
        await tx.playerProfile.update({
          where: { id: profile.id },
          data: {
            tokens: { increment: refund }
          }
        });

        await tx.transaction.create({
          data: {
            profileId: profile.id,
            type: 'earn',
            source: 'shop',
            amount: refund,
            balanceBefore: profile.tokens,
            balanceAfter: profile.tokens + refund,
            description: `Возврат за удаление ${equipment.template.name}`
          }
        });
      }
    });

    return { refund };
  }

  // Собрать со всего оборудования
  async collectAll(userId: string) {
    const profile = await prisma.playerProfile.findFirst({
      where: { userId },
      include: {
        equipment: {
          include: { template: true }
        }
      }
    });

    if (!profile) {
      throw new AppError('Профиль игрока не найден', 404);
    }

    let totalCollected = 0;

    for (const eq of profile.equipment) {
      const hoursPassed = (Date.now() - eq.lastCollectedAt.getTime()) / (1000 * 60 * 60);
      const produced = Math.floor(hoursPassed * eq.template.productionRate);
      const available = Math.min(produced + eq.currentStorage, eq.template.storageCapacity);

      if (available > 0) {
        totalCollected += available;

        await prisma.playerEquipment.update({
          where: { id: eq.id },
          data: {
            currentStorage: 0,
            lastCollectedAt: new Date()
          }
        });
      }
    }

    if (totalCollected > 0) {
      const updatedProfile = await prisma.playerProfile.update({
        where: { id: profile.id },
        data: {
          tokens: { increment: totalCollected }
        }
      });

      await prisma.transaction.create({
        data: {
          profileId: profile.id,
          type: 'earn',
          source: 'production',
          amount: totalCollected,
          balanceBefore: profile.tokens,
          balanceAfter: updatedProfile.tokens,
          description: 'Сбор со всего оборудования'
        }
      });

      await this.checkQuestProgress(profile.id, 'collect_resources');

      return {
        collected: totalCollected,
        newBalance: updatedProfile.tokens
      };
    }

    return {
      collected: 0,
      newBalance: profile.tokens
    };
  }

  // Вспомогательная функция для проверки пересечения
  private checkCollision(
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
  ): boolean {
    return !(
      x1 + w1 <= x2 ||
      x2 + w2 <= x1 ||
      y1 + h1 <= y2 ||
      y2 + h2 <= y1
    );
  }

  // Проверка прогресса заданий
  private async checkQuestProgress(profileId: string, questType: string) {
    const quest = await prisma.quest.findFirst({
      where: {
        type: 'tutorial',
        requirement: {
          contains: questType
        }
      }
    });

    if (!quest) return;

    const playerQuest = await prisma.playerQuest.findFirst({
      where: {
        profileId,
        questId: quest.id
      }
    });

    if (!playerQuest && questType !== 'register') {
      await prisma.playerQuest.create({
        data: {
          profileId,
          questId: quest.id,
          progress: JSON.stringify({ [questType]: 1 }),
          isCompleted: true,
          completedAt: new Date()
        }
      });
    }
  }
}
