import React from 'react';
import { soundEngine } from '../audio/soundEngine';
import { DAY_CONFIGS } from '../data/menuAndDays';
import type { SaveData, ShiftResult } from '../types/game';

interface ShiftSummaryProps {
  result: ShiftResult;
  saveData: SaveData;
  onNextDay: () => void;
  onReplay: () => void;
  onOpenShop: () => void;
  onMainMenu: () => void;
}

export const ShiftSummary: React.FC<ShiftSummaryProps> = ({
  result,
  saveData,
  onNextDay,
  onReplay,
  onOpenShop,
  onMainMenu,
}) => {
  const hasNextDay = result.mode === 'shift' && result.passed && result.dayNumber < DAY_CONFIGS.length;
  const dayConfig = DAY_CONFIGS.find((d) => d.day === result.dayNumber);

  return (
    <div className="menu-shell summary-shell">
      <div className="summary-card">
        <div className="summary-header">
          <span className="summary-tag">
            {result.mode === 'endless'
              ? 'ENDLESS RUSH COMPLETE'
              : `DAY ${result.dayNumber} SHIFT RECEIPT`}
          </span>
          <h1>
            {result.mode === 'endless'
              ? result.servedCount >= 15
                ? 'Space Coast Legend!'
                : 'Great Morning Rush!'
              : result.passed
                ? result.starsEarned === 3
                  ? '3-Star Sunrise Masterpiece!'
                  : 'Shift Complete!'
                : 'Keep Brewing — So Close!'}
          </h1>

          {result.isNewBest && <span className="new-best-pill">🏆 NEW PERSONAL BEST!</span>}

          {result.mode === 'shift' && (
            <div className="summary-stars" aria-label={`${result.starsEarned} of 3 stars earned`}>
              {[1, 2, 3].map((n) => (
                <span key={n} className={n <= result.starsEarned ? 'big-star lit' : 'big-star dim'}>
                  ★
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="receipt-grid">
          <div className="receipt-row">
            <span>Customers Served</span>
            <strong>{result.servedCount}</strong>
          </div>
          <div className="receipt-row">
            <span>Total Items Handed Over</span>
            <strong>{result.ordersDelivered}</strong>
          </div>
          <div className="receipt-row">
            <span>Best Combo Streak</span>
            <strong>{result.maxCombo}×</strong>
          </div>
          <div className="receipt-row">
            <span>Tips &amp; Bonuses</span>
            <strong>+${result.tipsEarned}</strong>
          </div>
          <div className="receipt-row">
            <span>Angry Walk-Outs</span>
            <strong className={result.angryWalkouts > 0 ? 'warn-text' : ''}>
              {result.angryWalkouts}
            </strong>
          </div>
          <div className="receipt-row receipt-total">
            <span>Total Added to Bank</span>
            <strong>+${result.coinsEarned}</strong>
          </div>
        </div>

        {result.mode === 'shift' && !result.passed && dayConfig && (
          <p className="summary-hint">
            Serve at least <strong>{dayConfig.starTargets[0]} customers</strong> to earn 1 star and unlock Day {result.dayNumber + 1}. You still kept all <strong>${result.coinsEarned}</strong> for upgrades!
          </p>
        )}

        <div className="summary-actions">
          {hasNextDay && (
            <button
              id="btn-summary-next"
              className="primary-btn"
              onClick={() => {
                soundEngine.playTap();
                onNextDay();
              }}
            >
              ☀️ Start Day {result.dayNumber + 1}
            </button>
          )}
          <button
            id="btn-summary-shop"
            className="accent-btn"
            onClick={() => {
              soundEngine.playTap();
              onOpenShop();
            }}
          >
            🛠 Upgrade Shop (${saveData.coins})
          </button>
          <button
            id="btn-summary-replay"
            className="secondary-btn"
            onClick={() => {
              soundEngine.playTap();
              onReplay();
            }}
          >
            ↻ Replay Shift
          </button>
          <button
            id="btn-summary-menu"
            className="secondary-btn"
            onClick={() => {
              soundEngine.playTap();
              onMainMenu();
            }}
          >
            Main Counter Menu
          </button>
        </div>
      </div>
    </div>
  );
};
