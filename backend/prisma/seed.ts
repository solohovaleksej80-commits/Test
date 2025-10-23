import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Создаем шаблоны оборудования
  const equipmentTemplates = [
    {
      name: 'Малая ферма',
      description: 'Базовая ферма, производит небольшое количество токенов',
      category: 'production',
      rarity: 'common',
      price: 100,
      width: 1,
      height: 1,
      productionRate: 10, // 10 токенов в час
      storageCapacity: 100,
      requiredLevel: 1,
      imageUrl: '/images/equipment/small-farm.png'
    },
    {
      name: 'Средняя ферма',
      description: 'Улучшенная ферма с большей производительностью',
      category: 'production',
      rarity: 'rare',
      price: 500,
      width: 2,
      height: 1,
      productionRate: 30,
      storageCapacity: 300,
      requiredLevel: 3,
      imageUrl: '/images/equipment/medium-farm.png'
    },
    {
      name: 'Большая ферма',
      description: 'Мощная ферма для опытных игроков',
      category: 'production',
      rarity: 'epic',
      price: 2000,
      width: 2,
      height: 2,
      productionRate: 100,
      storageCapacity: 1000,
      requiredLevel: 5,
      imageUrl: '/images/equipment/large-farm.png'
    },
    {
      name: 'Генератор',
      description: 'Автоматический генератор токенов',
      category: 'production',
      rarity: 'legendary',
      price: 5000,
      width: 2,
      height: 2,
      productionRate: 250,
      storageCapacity: 2500,
      requiredLevel: 10,
      imageUrl: '/images/equipment/generator.png'
    },
    {
      name: 'Склад',
      description: 'Увеличивает вместимость хранилища',
      category: 'storage',
      rarity: 'common',
      price: 300,
      width: 2,
      height: 2,
      productionRate: 0,
      storageCapacity: 500,
      requiredLevel: 2,
      imageUrl: '/images/equipment/storage.png'
    },
    {
      name: 'Декоративное дерево',
      description: 'Украшает вашу ферму',
      category: 'decoration',
      rarity: 'common',
      price: 50,
      width: 1,
      height: 1,
      productionRate: 0,
      storageCapacity: 0,
      requiredLevel: 1,
      imageUrl: '/images/equipment/tree.png'
    }
  ];

  console.log('Creating equipment templates...');
  for (const template of equipmentTemplates) {
    await prisma.equipmentTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template
    });
  }

  // Создаем задания
  const quests = [
    {
      title: 'Добро пожаловать!',
      description: 'Зарегистрируйтесь в игре',
      type: 'tutorial',
      requirement: JSON.stringify({ type: 'register' }),
      rewardTokens: 100,
      requiredLevel: 1,
      order: 1
    },
    {
      title: 'Первое оборудование',
      description: 'Разместите ваше первое оборудование на ферме',
      type: 'tutorial',
      requirement: JSON.stringify({ type: 'place_equipment', count: 1 }),
      rewardTokens: 50,
      requiredLevel: 1,
      order: 2
    },
    {
      title: 'Сбор урожая',
      description: 'Соберите ресурсы с оборудования',
      type: 'tutorial',
      requirement: JSON.stringify({ type: 'collect_resources', count: 1 }),
      rewardTokens: 30,
      requiredLevel: 1,
      order: 3
    },
    {
      title: 'Первая покупка',
      description: 'Купите оборудование в магазине',
      type: 'tutorial',
      requirement: JSON.stringify({ type: 'buy_equipment', count: 1 }),
      rewardTokens: 100,
      requiredLevel: 1,
      order: 4
    },
    {
      title: 'Пригласите друга',
      description: 'Пригласите друга по реферальной ссылке',
      type: 'tutorial',
      requirement: JSON.stringify({ type: 'invite_friend', count: 1 }),
      rewardTokens: 200,
      requiredLevel: 1,
      order: 5
    },
    {
      title: 'Ежедневный вход',
      description: 'Войдите в игру',
      type: 'daily',
      requirement: JSON.stringify({ type: 'daily_login' }),
      rewardTokens: 50,
      requiredLevel: 1,
      order: 10
    },
    {
      title: 'Активный фермер',
      description: 'Соберите ресурсы 3 раза за день',
      type: 'daily',
      requirement: JSON.stringify({ type: 'collect_resources', count: 3 }),
      rewardTokens: 75,
      requiredLevel: 1,
      order: 11
    },
    {
      title: 'Покупатель недели',
      description: 'Купите 5 единиц оборудования за неделю',
      type: 'weekly',
      requirement: JSON.stringify({ type: 'buy_equipment', count: 5 }),
      rewardTokens: 500,
      requiredLevel: 2,
      order: 20
    },
    {
      title: 'Коллекционер',
      description: 'Соберите все типы оборудования',
      type: 'achievement',
      requirement: JSON.stringify({ type: 'collect_all_equipment_types' }),
      rewardTokens: 1000,
      requiredLevel: 5,
      order: 30
    },
    {
      title: 'Магистр фермы',
      description: 'Достигните 10 уровня',
      type: 'achievement',
      requirement: JSON.stringify({ type: 'reach_level', level: 10 }),
      rewardTokens: 2000,
      requiredLevel: 1,
      order: 31
    }
  ];

  console.log('Creating quests...');
  for (const quest of quests) {
    await prisma.quest.upsert({
      where: { title: quest.title },
      update: quest,
      create: quest
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
