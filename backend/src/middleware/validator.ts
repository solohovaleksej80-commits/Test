import { body, ValidationChain } from 'express-validator';

// Валидация регистрации
export const registerValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Некорректный email адрес')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Пароль должен содержать минимум 8 символов')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Пароль должен содержать буквы и цифры'),
  body('telegramUsername')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Telegram username должен содержать минимум 3 символа')
];

// Валидация входа
export const loginValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Некорректный email адрес')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен')
];

// Валидация размещения оборудования
export const placeEquipmentValidation: ValidationChain[] = [
  body('templateId')
    .isUUID()
    .withMessage('Некорректный ID шаблона оборудования'),
  body('positionX')
    .isInt({ min: 0 })
    .withMessage('Позиция X должна быть неотрицательным числом'),
  body('positionY')
    .isInt({ min: 0 })
    .withMessage('Позиция Y должна быть неотрицательным числом')
];

// Валидация покупки
export const purchaseValidation: ValidationChain[] = [
  body('templateId')
    .isUUID()
    .withMessage('Некорректный ID шаблона оборудования')
];
