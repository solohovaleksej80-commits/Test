// Пользователь
export interface User {
  id: string;
  email: string;
  telegramUsername?: string;
}

// Профиль игрока
export interface PlayerProfile {
  id: string;
  level: number;
  experience: number;
  tokens: number;
  farmWidth: number;
  farmHeight: number;
  lastLogin: string;
  email: string;
  telegramUsername?: string;
}

// Шаблон оборудования
export interface EquipmentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: string;
  price: number;
  width: number;
  height: number;
  productionRate: number;
  storageCapacity: number;
  requiredLevel: number;
  imageUrl?: string;
  canAfford?: boolean;
}

// Оборудование на ферме
export interface Equipment {
  id: string;
  templateId: string;
  name: string;
  description: string;
  category: string;
  rarity: string;
  positionX: number;
  positionY: number;
  level: number;
  width: number;
  height: number;
  productionRate: number;
  storageCapacity: number;
  currentStorage: number;
  imageUrl?: string;
  lastCollectedAt: string;
}

// Ферма
export interface Farm {
  farmWidth: number;
  farmHeight: number;
  equipment: Equipment[];
}

// Задание
export interface Quest {
  id: string;
  title: string;
  description: string;
  type: string;
  rewardTokens: number;
  rewardEquipment?: string;
  requirement: any;
  progress: any;
  isCompleted: boolean;
  isClaimed: boolean;
  completedAt?: string;
  claimedAt?: string;
}

// Группы заданий
export interface QuestGroups {
  tutorial: Quest[];
  daily: Quest[];
  weekly: Quest[];
  achievements: Quest[];
}

// Реферал
export interface Referral {
  id: string;
  username: string;
  level: number;
  tokens: number;
  joinedAt: string;
  rewardClaimed: boolean;
}

// Статистика рефералов
export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarned: number;
  referrals: Array<{
    username: string;
    joinedAt: Date;
    isActive: boolean;
  }>;
}

// Ответы API
export interface AuthResponse {
  token: string;
  user: User;
  profile: {
    level: number;
    experience: number;
    tokens: number;
  };
}

export interface CollectResponse {
  collected: number;
  newBalance: number;
}

export interface PurchaseResponse {
  newBalance: number;
  purchasedItem: {
    id: string;
    name: string;
    description: string;
  };
}

export interface ClaimQuestResponse {
  tokens: number;
  newBalance: number;
  rewardEquipment?: string;
}
