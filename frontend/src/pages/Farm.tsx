import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store';
import { Equipment } from '../types';
import './Farm.css';

export const Farm: React.FC = () => {
  const { farm, loadFarm, collectResources, collectAll, removeEquipment } = useGameStore();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFarm();
  }, [loadFarm]);

  const handleCellClick = (x: number, y: number) => {
    if (!farm) return;

    // Проверяем, есть ли оборудование на этой клетке
    const equipment = farm.equipment.find(
      (eq) =>
        x >= eq.positionX &&
        x < eq.positionX + eq.width &&
        y >= eq.positionY &&
        y < eq.positionY + eq.height
    );

    if (equipment) {
      setSelectedEquipment(equipment);
    }
  };

  const handleCollect = async (equipmentId: string) => {
    setIsLoading(true);
    try {
      await collectResources(equipmentId);
      setSelectedEquipment(null);
    } catch (error) {
      console.error('Error collecting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollectAll = async () => {
    setIsLoading(true);
    try {
      await collectAll();
    } catch (error) {
      console.error('Error collecting all:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (equipmentId: string) => {
    if (!confirm('Вы уверены? Вы получите 50% от стоимости.')) return;

    setIsLoading(true);
    try {
      await removeEquipment(equipmentId);
      setSelectedEquipment(null);
    } catch (error) {
      console.error('Error removing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderGrid = () => {
    if (!farm) return null;

    const grid = [];
    const { farmWidth, farmHeight, equipment } = farm;

    for (let y = 0; y < farmHeight; y++) {
      for (let x = 0; x < farmWidth; x++) {
        const eq = equipment.find(
          (e) =>
            x >= e.positionX &&
            x < e.positionX + e.width &&
            y >= e.positionY &&
            y < e.positionY + e.height
        );

        const isTopLeft = eq && x === eq.positionX && y === eq.positionY;

        grid.push(
          <div
            key={`${x}-${y}`}
            className={`farm-cell ${eq ? 'occupied' : 'empty'} ${
              eq && isTopLeft ? 'equipment-root' : ''
            }`}
            onClick={() => handleCellClick(x, y)}
          >
            {eq && isTopLeft && (
              <div className={`equipment rarity-${eq.rarity}`}>
                <div className="equipment-icon">
                  {eq.category === 'production' && '🏭'}
                  {eq.category === 'storage' && '📦'}
                  {eq.category === 'decoration' && '🌳'}
                </div>
                {eq.currentStorage > 0 && (
                  <div className="equipment-ready">!</div>
                )}
              </div>
            )}
          </div>
        );
      }
    }

    return grid;
  };

  const getTotalAvailable = () => {
    if (!farm) return 0;
    return farm.equipment.reduce((sum, eq) => sum + eq.currentStorage, 0);
  };

  if (!farm) {
    return (
      <div className="farm-page">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const totalAvailable = getTotalAvailable();

  return (
    <div className="farm-page">
      <div className="farm-header">
        <h2>Моя ферма</h2>
        {totalAvailable > 0 && (
          <button
            className="button button-primary collect-all-btn"
            onClick={handleCollectAll}
            disabled={isLoading}
          >
            Собрать всё ({totalAvailable} 🪙)
          </button>
        )}
      </div>

      <div className="farm-container">
        <div
          className="farm-grid"
          style={{
            gridTemplateColumns: `repeat(${farm.farmWidth}, 1fr)`,
            gridTemplateRows: `repeat(${farm.farmHeight}, 1fr)`
          }}
        >
          {renderGrid()}
        </div>
      </div>

      {farm.equipment.length === 0 && (
        <div className="empty-farm">
          <p>Ваша ферма пуста!</p>
          <p>Купите оборудование в магазине, чтобы начать зарабатывать токены.</p>
        </div>
      )}

      {selectedEquipment && (
        <div className="modal-overlay" onClick={() => setSelectedEquipment(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedEquipment.name}</h3>
              <button
                className="modal-close"
                onClick={() => setSelectedEquipment(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="equipment-description">{selectedEquipment.description}</p>

              <div className="equipment-stats">
                <div className="stat">
                  <span className="stat-label">Уровень:</span>
                  <span className="stat-value">{selectedEquipment.level}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Производство:</span>
                  <span className="stat-value">
                    {selectedEquipment.productionRate} 🪙/час
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Накоплено:</span>
                  <span className="stat-value">
                    {selectedEquipment.currentStorage} / {selectedEquipment.storageCapacity}
                  </span>
                </div>
              </div>

              <div className="modal-actions">
                {selectedEquipment.currentStorage > 0 && (
                  <button
                    className="button button-primary"
                    onClick={() => handleCollect(selectedEquipment.id)}
                    disabled={isLoading}
                  >
                    Собрать ({selectedEquipment.currentStorage} 🪙)
                  </button>
                )}
                <button
                  className="button button-outline"
                  onClick={() => handleRemove(selectedEquipment.id)}
                  disabled={isLoading}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
