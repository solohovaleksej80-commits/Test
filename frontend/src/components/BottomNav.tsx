import React from 'react';
import { NavLink } from 'react-router-dom';

export const BottomNav: React.FC = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/farm" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <div className="nav-icon">🌾</div>
        <span>Ферма</span>
      </NavLink>

      <NavLink to="/shop" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <div className="nav-icon">🏪</div>
        <span>Магазин</span>
      </NavLink>

      <NavLink to="/quests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <div className="nav-icon">📋</div>
        <span>Задания</span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <div className="nav-icon">👤</div>
        <span>Профиль</span>
      </NavLink>
    </nav>
  );
};
