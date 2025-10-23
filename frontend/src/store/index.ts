import { create } from 'zustand';
import {
  PlayerProfile,
  Farm,
  Equipment,
  EquipmentTemplate,
  QuestGroups,
  ReferralStats
} from '../types';
import { api } from '../api/client';

interface GameState {
  // Auth
  token: string | null;
  isAuthenticated: boolean;

  // Player
  profile: PlayerProfile | null;
  farm: Farm | null;

  // Shop
  shopItems: EquipmentTemplate[];

  // Quests
  quests: QuestGroups | null;

  // Referral
  referralStats: ReferralStats | null;
  referralLink: string | null;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, telegramUsername?: string, referralCode?: string) => Promise<void>;
  logout: () => void;

  loadProfile: () => Promise<void>;
  loadFarm: () => Promise<void>;
  loadShopItems: () => Promise<void>;
  loadQuests: () => Promise<void>;
  loadReferralData: () => Promise<void>;

  placeEquipment: (templateId: string, x: number, y: number) => Promise<void>;
  collectResources: (equipmentId: string) => Promise<void>;
  collectAll: () => Promise<void>;
  removeEquipment: (equipmentId: string) => Promise<void>;

  purchaseItem: (templateId: string) => Promise<void>;
  claimQuest: (questId: string) => Promise<void>;

  setError: (error: string | null) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  profile: null,
  farm: null,
  shopItems: [],
  quests: null,
  referralStats: null,
  referralLink: null,
  isLoading: false,
  error: null,

  // Auth actions
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.login(email, password);

      localStorage.setItem('token', data.token);
      set({
        token: data.token,
        isAuthenticated: true,
        isLoading: false
      });

      // Load initial data
      await get().loadProfile();
      await get().loadFarm();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ошибка входа',
        isLoading: false
      });
      throw error;
    }
  },

  register: async (email, password, telegramUsername, referralCode) => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.register(email, password, telegramUsername, referralCode);

      localStorage.setItem('token', data.token);
      set({
        token: data.token,
        isAuthenticated: true,
        isLoading: false
      });

      // Load initial data
      await get().loadProfile();
      await get().loadFarm();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ошибка регистрации',
        isLoading: false
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      token: null,
      isAuthenticated: false,
      profile: null,
      farm: null,
      shopItems: [],
      quests: null,
      referralStats: null,
      referralLink: null
    });
  },

  // Load data
  loadProfile: async () => {
    try {
      const profile = await api.getProfile();
      set({ profile });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка загрузки профиля' });
    }
  },

  loadFarm: async () => {
    try {
      const farm = await api.getFarm();
      set({ farm });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка загрузки фермы' });
    }
  },

  loadShopItems: async () => {
    try {
      const shopItems = await api.getShopItems();
      set({ shopItems });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка загрузки магазина' });
    }
  },

  loadQuests: async () => {
    try {
      const quests = await api.getQuests();
      set({ quests });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка загрузки заданий' });
    }
  },

  loadReferralData: async () => {
    try {
      const [linkData, stats] = await Promise.all([
        api.getReferralLink(),
        api.getReferralStats()
      ]);
      set({
        referralLink: linkData.link,
        referralStats: stats
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка загрузки реферальных данных' });
    }
  },

  // Game actions
  placeEquipment: async (templateId, x, y) => {
    try {
      await api.placeEquipment(templateId, x, y);
      await get().loadFarm();
      await get().loadProfile(); // Обновляем профиль (может измениться опыт)
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка размещения оборудования' });
      throw error;
    }
  },

  collectResources: async (equipmentId) => {
    try {
      const result = await api.collectResources(equipmentId);

      // Обновляем баланс токенов
      if (get().profile) {
        set({
          profile: {
            ...get().profile!,
            tokens: result.newBalance
          }
        });
      }

      await get().loadFarm(); // Обновляем ферму
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка сбора ресурсов' });
      throw error;
    }
  },

  collectAll: async () => {
    try {
      const result = await api.collectAll();

      // Обновляем баланс токенов
      if (get().profile) {
        set({
          profile: {
            ...get().profile!,
            tokens: result.newBalance
          }
        });
      }

      await get().loadFarm();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка сбора ресурсов' });
      throw error;
    }
  },

  removeEquipment: async (equipmentId) => {
    try {
      await api.removeEquipment(equipmentId);
      await get().loadFarm();
      await get().loadProfile();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка удаления оборудования' });
      throw error;
    }
  },

  // Shop actions
  purchaseItem: async (templateId) => {
    try {
      const result = await api.purchase(templateId);

      // Обновляем баланс токенов
      if (get().profile) {
        set({
          profile: {
            ...get().profile!,
            tokens: result.newBalance
          }
        });
      }

      await get().loadShopItems(); // Обновляем магазин
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка покупки' });
      throw error;
    }
  },

  // Quest actions
  claimQuest: async (questId) => {
    try {
      const result = await api.claimQuestReward(questId);

      // Обновляем баланс токенов
      if (get().profile) {
        set({
          profile: {
            ...get().profile!,
            tokens: result.newBalance
          }
        });
      }

      await get().loadQuests(); // Обновляем задания
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка получения награды' });
      throw error;
    }
  },

  setError: (error) => set({ error })
}));
