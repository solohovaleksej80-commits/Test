import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store';
import { EquipmentTemplate } from '../types';
import './Shop.css';

export const Shop: React.FC = () => {
  const { shopItems, profile, loadShopItems, purchaseItem, placeEquipment } = useGameStore();
  const [selectedItem, setSelectedItem] = useState<EquipmentTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadShopItems();
  }, [loadShopItems]);

  const handlePurchase = async (templateId: string) => {
    setIsLoading(true);
    try {
      await purchaseItem(templateId);
      setSelectedItem(null);
      // Обновляем список товаров
      await loadShopItems();
    } catch (error) {
      console.error('Error purchasing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return '#9E9E9E';
      case 'rare':
        return '#2196F3';
      case 'epic':
        return '#9C27B0';
      case 'legendary':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'Обычное';
      case 'rare':
        return 'Редкое';
      case 'epic':
        return 'Эпическое';
      case 'legendary':
        return 'Легендарное';
      default:
        return rarity;
    }
  };

  if (shopItems.length === 0) {
    return (
      <div className="shop-page">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h2>Магазин оборудования</h2>
        <p className="shop-subtitle">Покупайте оборудование и развивайте свою ферму</p>
      </div>

      <div className="shop-grid">
        {shopItems.map((item) => (
          <div
            key={item.id}
            className="shop-item"
            onClick={() => setSelectedItem(item)}
          >
            <div
              className="item-header"
              style={{ background: getRarityColor(item.rarity) }}
            >
              <div className="item-icon">
                {item.category === 'production' && '🏭'}
                {item.category === 'storage' && '📦'}
                {item.category === 'decoration' && '🌳'}
              </div>
              <span className="item-rarity">{getRarityName(item.rarity)}</span>
            </div>

            <div className="item-body">
              <h3 className="item-name">{item.name}</h3>
              <p className="item-description">{item.description}</p>

              {item.productionRate > 0 && (
                <div className="item-stat">
                  <span>📊</span>
                  <span>{item.productionRate} 🪙/час</span>
                </div>
              )}

              <div className="item-footer">
                <div className="item-price">
                  <span className="price-icon">🪙</span>
                  <span className="price-amount">{item.price.toLocaleString()}</span>
                </div>
                {!item.canAfford && (
                  <span className="cannot-afford">Недостаточно токенов</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedItem.name}</h3>
              <button
                className="modal-close"
                onClick={() => setSelectedItem(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div
                className="modal-item-icon"
                style={{ background: getRarityColor(selectedItem.rarity) }}
              >
                {selectedItem.category === 'production' && '🏭'}
                {selectedItem.category === 'storage' && '📦'}
                {selectedItem.category === 'decoration' && '🌳'}
              </div>

              <p className="modal-description">{selectedItem.description}</p>

              <div className="modal-stats">
                <div className="stat">
                  <span>Редкость:</span>
                  <span style={{ color: getRarityColor(selectedItem.rarity) }}>
                    {getRarityName(selectedItem.rarity)}
                  </span>
                </div>
                <div className="stat">
                  <span>Размер:</span>
                  <span>{selectedItem.width}x{selectedItem.height}</span>
                </div>
                {selectedItem.productionRate > 0 && (
                  <div className="stat">
                    <span>Производство:</span>
                    <span>{selectedItem.productionRate} 🪙/час</span>
                  </div>
                )}
                {selectedItem.storageCapacity > 0 && (
                  <div className="stat">
                    <span>Хранилище:</span>
                    <span>{selectedItem.storageCapacity} 🪙</span>
                  </div>
                )}
                <div className="stat">
                  <span>Требуется уровень:</span>
                  <span>{selectedItem.requiredLevel}</span>
                </div>
              </div>

              <div className="modal-price">
                <span>Цена:</span>
                <span className="price-large">
                  {selectedItem.price.toLocaleString()} 🪙
                </span>
              </div>

              <div className="modal-actions">
                <button
                  className={`button ${
                    selectedItem.canAfford
                      ? 'button-primary'
                      : 'button-disabled'
                  }`}
                  onClick={() => handlePurchase(selectedItem.id)}
                  disabled={!selectedItem.canAfford || isLoading}
                >
                  {isLoading
                    ? 'Покупка...'
                    : selectedItem.canAfford
                    ? 'Купить'
                    : 'Недостаточно токенов'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
