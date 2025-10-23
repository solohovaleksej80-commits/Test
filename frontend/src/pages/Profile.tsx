import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store';
import './Profile.css';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { profile, referralLink, referralStats, loadProfile, loadReferralData, logout } =
    useGameStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadProfile();
    loadReferralData();
  }, [loadProfile, loadReferralData]);

  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header-section">
        <h2>Профиль игрока</h2>
      </div>

      <div className="card">
        <div className="profile-info">
          <div className="profile-avatar">
            <span className="avatar-icon">👤</span>
          </div>
          <div className="profile-details">
            <h3>{profile.email}</h3>
            {profile.telegramUsername && (
              <p className="telegram-username">@{profile.telegramUsername}</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Статистика</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Уровень</span>
            <span className="stat-value">{profile.level}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Опыт</span>
            <span className="stat-value">{profile.experience}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Токены</span>
            <span className="stat-value">{profile.tokens.toLocaleString()} 🪙</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Размер фермы</span>
            <span className="stat-value">
              {profile.farmWidth}x{profile.farmHeight}
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Реферальная программа</h3>

        {referralLink ? (
          <>
            <p className="referral-description">
              Приглашайте друзей и получайте награды!
            </p>

            <div className="referral-link-container">
              <input
                type="text"
                className="referral-link-input"
                value={referralLink}
                readOnly
              />
              <button
                className={`button ${copied ? 'button-secondary' : 'button-primary'}`}
                onClick={handleCopyLink}
              >
                {copied ? '✓ Скопировано' : 'Копировать'}
              </button>
            </div>

            {referralStats && (
              <div className="referral-stats">
                <div className="referral-stat">
                  <span className="referral-stat-value">{referralStats.totalReferrals}</span>
                  <span className="referral-stat-label">Приглашено друзей</span>
                </div>
                <div className="referral-stat">
                  <span className="referral-stat-value">{referralStats.activeReferrals}</span>
                  <span className="referral-stat-label">Активных рефералов</span>
                </div>
                <div className="referral-stat">
                  <span className="referral-stat-value">
                    {referralStats.totalEarned.toLocaleString()} 🪙
                  </span>
                  <span className="referral-stat-label">Заработано с рефералов</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="no-referral">
            Привяжите Telegram аккаунт, чтобы получить реферальную ссылку
          </p>
        )}
      </div>

      <div className="card">
        <button className="button button-outline logout-button" onClick={handleLogout}>
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
};
