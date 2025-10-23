import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store';
import { Quest } from '../types';
import './Quests.css';

export const Quests: React.FC = () => {
  const { quests, loadQuests, claimQuest } = useGameStore();
  const [activeTab, setActiveTab] = useState<'tutorial' | 'daily' | 'weekly' | 'achievements'>('tutorial');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  const handleClaim = async (questId: string) => {
    setIsLoading(true);
    try {
      await claimQuest(questId);
      await loadQuests();
    } catch (error) {
      console.error('Error claiming quest:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuests = (questList: Quest[]) => {
    if (questList.length === 0) {
      return (
        <div className="no-quests">
          <p>Нет доступных заданий</p>
        </div>
      );
    }

    return questList.map((quest) => (
      <div key={quest.id} className={`quest-card ${quest.isCompleted ? 'completed' : ''}`}>
        <div className="quest-header">
          <h3 className="quest-title">{quest.title}</h3>
          <span className="quest-reward">+{quest.rewardTokens} 🪙</span>
        </div>

        <p className="quest-description">{quest.description}</p>

        <div className="quest-footer">
          {quest.isClaimed ? (
            <span className="quest-status claimed">✓ Выполнено</span>
          ) : quest.isCompleted ? (
            <button
              className="button button-primary"
              onClick={() => handleClaim(quest.id)}
              disabled={isLoading}
            >
              Получить награду
            </button>
          ) : (
            <span className="quest-status in-progress">В процессе...</span>
          )}
        </div>
      </div>
    ));
  };

  if (!quests) {
    return (
      <div className="quests-page">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="quests-page">
      <div className="quests-header">
        <h2>Задания</h2>
        <p className="quests-subtitle">Выполняйте задания и получайте награды</p>
      </div>

      <div className="quest-tabs">
        <button
          className={`tab ${activeTab === 'tutorial' ? 'active' : ''}`}
          onClick={() => setActiveTab('tutorial')}
        >
          Обучение
        </button>
        <button
          className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          Ежедневные
        </button>
        <button
          className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          Еженедельные
        </button>
        <button
          className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Достижения
        </button>
      </div>

      <div className="quests-list">
        {renderQuests(quests[activeTab])}
      </div>
    </div>
  );
};
