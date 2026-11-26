import React from 'react';
import { soundEngine } from '../audio/soundEngine';
import { DAY_CONFIGS } from '../data/menuAndDays';
import type { SaveData } from '../types/game';

interface DaySelectProps {
  saveData: SaveData;
  onSelectDay: (day: number) => void;
  onOpenShop: () => void;
  onBack: () => void;
}

export const DaySelect: React.FC<DaySelectProps> = ({
  saveData,
  onSelectDay,
  onOpenShop,
  onBack,
}) => {
  return (
    <div className="menu-shell">
      <header className="menu-topbar">
        <button
          id="btn-days-back"
          className="secondary-btn compact-btn"
          onClick={() => {
            soundEngine.playTap();
            onBack();
          }}
        >
          ← Back
        </button>
        <h1 className="page-title">7-Day Sunrise Shift Schedule</h1>
        <button
          id="btn-days-shop"
          className="primary-btn compact-btn"
          onClick={() => {
            soundEngine.playTap();
            onOpenShop();
          }}
        >
          🛠 Shop (${saveData.coins})
        </button>
      </header>

      <main className="day-grid">
        {DAY_CONFIGS.map((day) => {
          const unlocked = day.day <= saveData.unlockedDay;
          const stars = saveData.dayStars[day.day] ?? 0;
          const best = saveData.dayBestServed[day.day] ?? 0;

          return (
            <div key={day.day} className={`day-card ${unlocked ? 'unlocked' : 'locked'}`}>
              <div className="day-card-top">
                <span className="day-badge">DAY {day.day}</span>
                <div className="star-row" aria-label={`${stars} of 3 stars`}>
                  {[1, 2, 3].map((n) => (
                    <span key={n} className={n <= stars ? 'star-lit' : 'star-dim'}>
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <h2>{day.title}</h2>
              <p className="day-subtitle">{day.subtitle}</p>

              <div className="day-unlocks">
                {day.newUnlocks.map((u) => (
                  <span key={u} className="unlock-tag">
                    + {u}
                  </span>
                ))}
              </div>

              <div className="day-card-footer">
                <div className="day-goals">
                  <span>Goal: {day.starTargets[0]} / {day.starTargets[1]} / {day.starTargets[2]} served</span>
                  {best > 0 && <small>Personal Best: {best} served</small>}
                </div>

                <button
                  id={`btn-play-day-${day.day}`}
                  className={unlocked ? 'primary-btn compact-btn' : 'locked-btn compact-btn'}
                  disabled={!unlocked}
                  onClick={() => {
                    soundEngine.playTap();
                    onSelectDay(day.day);
                  }}
                >
                  {unlocked ? (stars > 0 ? 'Replay Shift' : 'Open Shop!') : '🔒 Locked'}
                </button>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};
