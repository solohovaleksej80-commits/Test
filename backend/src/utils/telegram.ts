import crypto from 'crypto';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

/**
 * Проверяет подлинность данных от Telegram WebApp
 * @param initData - данные от Telegram.WebApp.initData
 * @returns true если данные подлинные
 */
export const verifyTelegramWebAppData = (initData: string): boolean => {
  if (!BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN не установлен');
    return false;
  }

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    if (!hash) {
      return false;
    }

    // Сортируем параметры
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создаем секретный ключ
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(BOT_TOKEN)
      .digest();

    // Вычисляем хэш
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  } catch (error) {
    console.error('Ошибка проверки Telegram данных:', error);
    return false;
  }
};

/**
 * Парсит initData от Telegram WebApp
 */
export const parseTelegramInitData = (initData: string): any => {
  const urlParams = new URLSearchParams(initData);
  const userParam = urlParams.get('user');

  if (!userParam) {
    return null;
  }

  try {
    return JSON.parse(userParam);
  } catch (error) {
    console.error('Ошибка парсинга user данных:', error);
    return null;
  }
};

/**
 * Генерирует реферальную ссылку для пользователя
 */
export const generateReferralLink = (username: string): string => {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'YourBot';
  return `https://t.me/${botUsername}?start=ref_${username}`;
};
