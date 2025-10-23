import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor для добавления токена к запросам
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor для обработки ошибок
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Удаляем токен и перенаправляем на страницу входа
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(email: string, password: string, telegramUsername?: string, referralCode?: string) {
    const response = await this.client.post('/auth/register', {
      email,
      password,
      telegramUsername,
      referralCode
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async linkTelegram(initData: string) {
    const response = await this.client.post('/auth/link-telegram', { initData });
    return response.data;
  }

  // Game
  async getProfile() {
    const response = await this.client.get('/game/profile');
    return response.data;
  }

  async getFarm() {
    const response = await this.client.get('/game/farm');
    return response.data;
  }

  async placeEquipment(templateId: string, positionX: number, positionY: number) {
    const response = await this.client.post('/game/equipment', {
      templateId,
      positionX,
      positionY
    });
    return response.data;
  }

  async collectResources(equipmentId: string) {
    const response = await this.client.post(`/game/equipment/${equipmentId}/collect`);
    return response.data;
  }

  async collectAll() {
    const response = await this.client.post('/game/collect-all');
    return response.data;
  }

  async removeEquipment(equipmentId: string) {
    const response = await this.client.delete(`/game/equipment/${equipmentId}`);
    return response.data;
  }

  // Shop
  async getShopItems() {
    const response = await this.client.get('/shop/items');
    return response.data;
  }

  async purchase(templateId: string) {
    const response = await this.client.post('/shop/buy', { templateId });
    return response.data;
  }

  // Quests
  async getQuests() {
    const response = await this.client.get('/quests');
    return response.data;
  }

  async claimQuestReward(questId: string) {
    const response = await this.client.post(`/quests/${questId}/claim`);
    return response.data;
  }

  // Referral
  async getReferralLink() {
    const response = await this.client.get('/referral/link');
    return response.data;
  }

  async getReferralStats() {
    const response = await this.client.get('/referral/stats');
    return response.data;
  }

  async getReferrals() {
    const response = await this.client.get('/referral/list');
    return response.data;
  }
}

export const api = new ApiClient();
