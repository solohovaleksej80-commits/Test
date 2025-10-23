import React from 'react';
import { useGameStore } from '../store';
import './Header.css';

export const Header: React.FC = () => {
  const { profile } = useGameStore();

  if (!profile) return null;

  return (
    <header className="header">
      <div className="header-content">
        <div className="player-info">
          <span className="player-level">Уровень {profile.level}</span>
          <div className="xp-bar">
            <div
              className="xp-fill"
              style={{
                width: `${(profile.experience % 100)}%`
              }}
            />
          </div>
        </div>

        <div className="tokens">
          <span className="token-icon">🪙</span>
          <span className="token-amount">{profile.tokens.toLocaleString()}</span>
        </div>
      </div>
    </header>
  );
};
