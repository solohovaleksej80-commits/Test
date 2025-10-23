import { Request } from 'express';

// Расширение Request для добавления userId после аутентификации
export interface AuthRequest extends Request {
  userId?: string;
}

// DTO для регистрации
export interface RegisterDTO {
  email: string;
  password: string;
  telegramUsername?: string;
  referralCode?: string;
}

// DTO для входа
export interface LoginDTO {
  email: string;
  password: string;
}

// DTO для Telegram авторизации
export interface TelegramAuthDTO {
  telegramId: string;
  telegramUsername?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  authDate: number;
  hash: string;
}

// Ответ с токеном
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    telegramUsername?: string;
  };
  profile: {
    level: number;
    experience: number;
    tokens: number;
  };
}

// Позиция на ферме
export interface Position {
  x: number;
  y: number;
}

// DTO для размещения оборудования
export interface PlaceEquipmentDTO {
  templateId: string;
  positionX: number;
  positionY: number;
}

// DTO для покупки в магазине
export interface PurchaseDTO {
  templateId: string;
  quantity?: number;
}

// Прогресс задания
export interface QuestProgress {
  [key: string]: number | boolean | string;
}

// Требования задания
export interface QuestRequirement {
  type: string;
  count?: number;
  level?: number;
  [key: string]: any;
}

// Статистика реферальной системы
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

// Ответ с ошибкой
export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}

// Конфигурация игры
export interface GameConfig {
  initialTokens: number;
  referralReward: number;
  refereeReward: number;
  experiencePerLevel: number;
  maxFarmSize: number;
}
