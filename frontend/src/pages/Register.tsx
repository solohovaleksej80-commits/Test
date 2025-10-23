import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useGameStore } from '../store';
import './Auth.css';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, error, setError } = useGameStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    // Получаем реферальный код из URL
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref);
    }
  }, [searchParams]);

  const validatePassword = (pass: string): boolean => {
    if (pass.length < 8) {
      setPasswordError('Пароль должен содержать минимум 8 символов');
      return false;
    }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(pass)) {
      setPasswordError('Пароль должен содержать буквы и цифры');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePassword(password)) {
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, telegramUsername || undefined, referralCode || undefined);
      navigate('/farm');
    } catch (err) {
      // Ошибка уже установлена в store
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Регистрация</h1>
        <p className="auth-subtitle">Создайте аккаунт и начните играть!</p>

        {referralCode && (
          <div className="referral-info">
            Вас пригласил: <strong>{referralCode}</strong>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль *</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              placeholder="Минимум 8 символов"
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Подтвердите пароль *</label>
            <input
              id="confirmPassword"
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите пароль"
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="telegramUsername">Telegram Username (опционально)</label>
            <input
              id="telegramUsername"
              type="text"
              className="input"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
              placeholder="@username"
            />
            <small>Нужен для реферальной системы</small>
          </div>

          {passwordError && <div className="error-message">{passwordError}</div>}
          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className={`button button-primary ${isLoading ? 'button-disabled' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Уже есть аккаунт?{' '}
            <Link to="/login" className="auth-link">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
