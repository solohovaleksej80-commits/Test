import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { PurchaseDTO } from '../types';

const prisma = new PrismaClient();

export class ShopService {
  // Получить все товары в магазине
  async getShopItems(userId: string) {
    const profile = await prisma.playerProfile.findFirst({
      where: { userId }
    });

    if (!profile) {
      throw new AppError('Профиль игрока не найден', 404);
    }

    // Получаем все активные шаблоны оборудования
    const items = await prisma.equipmentTemplate.findMany({
      where: {
        isActive: true,
        requiredLevel: {
          lte: profile.level
        }
      },
      orderBy: [
        { requiredLevel: 'asc' },
        { price: 'asc' }
      ]
    });

    return items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      rarity: item.rarity,
      price: item.price,
      width: item.width,
      height: item.height,
      productionRate: item.productionRate,
      storageCapacity: item.storageCapacity,
      requiredLevel: item.requiredLevel,
      imageUrl: item.imageUrl,
      canAfford: profile.tokens >= item.price
    }));
  }

  // Купить оборудование
  async purchaseItem(userId: string, data: PurchaseDTO) {
    const profile = await prisma.playerProfile.findFirst({
      where: { userId }
    });

    if (!profile) {
      throw new AppError('Профиль игрока не найден', 404);
    }

    const template = await prisma.equipmentTemplate.findUnique({
      where: { id: data.templateId }
    });

    if (!template) {
      throw new AppError('Товар не найден', 404);
    }

    if (!template.isActive) {
      throw new AppError('Этот товар больше не доступен', 400);
    }

    if (profile.level < template.requiredLevel) {
      throw new AppError(
        `Требуется ${template.requiredLevel} уровень для покупки этого товара`,
        400
      );
    }

    if (profile.tokens < template.price) {
      throw new AppError('Недостаточно токенов', 400);
    }

    // Покупаем в транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Списываем токены
      const updatedProfile = await tx.playerProfile.update({
        where: { id: profile.id },
        data: {
          tokens: { decrement: template.price }
        }
      });

      // Записываем транзакцию
      await tx.transaction.create({
        data: {
          profileId: profile.id,
          type: 'spend',
          source: 'shop',
          amount: template.price,
          balanceBefore: profile.tokens,
          balanceAfter: updatedProfile.tokens,
          description: `Покупка: ${template.name}`,
          metadata: JSON.stringify({ templateId: template.id })
        }
      });

      return {
        newBalance: updatedProfile.tokens,
        purchasedItem: {
          id: template.id,
          name: template.name,
          description: template.description
        }
      };
    });

    // Проверяем задание "Первая покупка"
    await this.checkBuyQuestProgress(profile.id);

    return result;
  }

  private async checkBuyQuestProgress(profileId: string) {
    const quest = await prisma.quest.findFirst({
      where: {
        type: 'tutorial',
        requirement: {
          contains: 'buy_equipment'
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

    if (!playerQuest) {
      await prisma.playerQuest.create({
        data: {
          profileId,
          questId: quest.id,
          progress: JSON.stringify({ buy_equipment: 1 }),
          isCompleted: true,
          completedAt: new Date()
        }
      });
    }
  }
}
