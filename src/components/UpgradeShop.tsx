import React from 'react';
import { soundEngine } from '../audio/soundEngine';
import { UPGRADE_CATALOG } from '../data/menuAndDays';
import type { SaveData, UpgradeId } from '../types/game';

interface UpgradeShopProps {
  saveData: SaveData;
  onBuyUpgrade: (id: UpgradeId, cost: number) => void;
  onBack: () => void;
}

const STATION_META: Record<'breakfast' | 'coffee' | 'bakery' | 'decor', { title: string; icon: string }> = {
  breakfast: { title: 'Breakfast in a Cup Station', icon: '🥓' },
  coffee: { title: 'Coffee & Espresso Bar', icon: '☕' },
  bakery: { title: 'Bakery Oven & Case', icon: '🥖' },
  decor: { title: 'Hopkins Ave Cafe Vibe', icon: '☀️' },
};

export const UpgradeShop: React.FC<UpgradeShopProps> = ({ saveData, onBuyUpgrade, onBack }) => {
  const stations: Array<'breakfast' | 'coffee' | 'bakery' | 'decor'> = [
    'breakfast',
    'coffee',
    'bakery',
    'decor',
  ];

  return (
    <div className="menu-shell">
      <header className="menu-topbar">
        <button
          id="btn-shop-back"
          className="secondary-btn compact-btn"
          onClick={() => {
            soundEngine.playTap();
            onBack();
          }}
        >
          ← Back
        </button>
        <h1 className="page-title">Sunrise Equipment &amp; Upgrade Shop</h1>
        <div className="stat-chip chip-gold">💰 ${saveData.coins} Available</div>
      </header>

      <main className="shop-sections">
        {stations.map((stationKey) => {
          const items = UPGRADE_CATALOG.filter((u) => u.station === stationKey);
          return (
            <section key={stationKey} className="shop-group">
              <h2 className="shop-group-title">
                <span>{STATION_META[stationKey].icon}</span> {STATION_META[stationKey].title}
              </h2>
              <div className="shop-grid">
                {items.map((upg) => {
                  const lvl = saveData.upgrades[upg.id] ?? 0;
                  const isMax = lvl >= upg.maxLevel;
                  const nextCost = isMax ? 0 : upg.costs[lvl];
                  const canAfford = !isMax && saveData.coins >= nextCost;

                  return (
                    <div key={upg.id} className={`upgrade-card ${isMax ? 'maxed' : ''}`}>
                      <div className="upgrade-top">
                        <span className="upgrade-badge">{upg.badge}</span>
                        <div className="upgrade-pips">
                          {Array.from({ length: upg.maxLevel }).map((_, i) => (
                            <span key={i} className={`pip ${i < lvl ? 'filled' : ''}`} />
                          ))}
                        </div>
                      </div>

                      <h3>{upg.name}</h3>
                      <p>{upg.description}</p>

                      <div className="upgrade-delta">
                        <span className="delta-current">{upg.levelLabels[lvl]}</span>
                        {!isMax && (
                          <>
                            <span className="delta-arrow">→</span>
                            <span className="delta-next">{upg.levelLabels[lvl + 1]}</span>
                          </>
                        )}
                      </div>

                      <button
                        id={`btn-buy-${upg.id}`}
                        className={
                          isMax
                            ? 'maxed-btn compact-btn'
                            : canAfford
                              ? 'primary-btn compact-btn'
                              : 'locked-btn compact-btn'
                        }
                        disabled={isMax || !canAfford}
                        onClick={() => {
                          if (canAfford) {
                            soundEngine.playUpgrade();
                            onBuyUpgrade(upg.id, nextCost);
                          }
                        }}
                      >
                        {isMax ? '✓ MAXED OUT' : `Upgrade • $${nextCost}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
};
