import React, { useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { DAY_CONFIGS } from '../data/menuAndDays';
import type { SaveData } from '../types/game';
import {
  BakeryItemArt,
  BreakfastCupArt,
  CoffeeCupArt,
  SunriseLogo,
  TitusvilleWindow,
} from './Art';

interface TitleScreenProps {
  saveData: SaveData;
  onOpenDays: () => void;
  onStartEndless: () => void;
  onOpenShop: () => void;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  saveData,
  onOpenDays,
  onStartEndless,
  onOpenShop,
  onToggleMute,
}) => {
  const [showHowTo, setShowHowTo] = useState(false);

  const totalStars = Object.values(saveData.dayStars).reduce((sum, s) => sum + s, 0);
  const maxStars = DAY_CONFIGS.length * 3;

  return (
    <div className="menu-shell title-screen">
      {/* Top Bar */}
      <header className="menu-topbar">
        <SunriseLogo compact />
        <div className="topbar-stats">
          <span className="stat-chip chip-gold">💰 ${saveData.coins}</span>
          <span className="stat-chip chip-star">
            ★ {totalStars}/{maxStars}
          </span>
          <button
            id="btn-mute-title"
            className="hud-icon-btn"
            onClick={onToggleMute}
            title={saveData.muted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {saveData.muted ? '🔇' : '🔊'}
          </button>
        </div>
      </header>

      {/* Sunlit Titusville Hero Banner */}
      <main className="title-hero-card">
        <div className="hero-window-wrap">
          <TitusvilleWindow rocketActive rocketProgress={0.42} />
          <div className="hero-overlay-badge">
            <h1>Sunrise Bread &amp; Coffee Company</h1>
            <p>
              Titusville&apos;s favorite Space Coast morning counter! Layer piping-hot{' '}
              <strong>Breakfast in a Cup</strong>, craft flavored coffees, and serve baked goods before the rocket rush hits!
            </p>
          </div>
        </div>

        {/* Signature Menu Showcase */}
        <div className="hero-showcase">
          <div className="showcase-item">
            <BreakfastCupArt hasSausage hasEgg hasGravy cheddar biscuit size={76} />
            <div>
              <strong>Breakfast in a Cup</strong>
              <span>Sausage, egg &amp; country gravy layered hot</span>
            </div>
          </div>
          <div className="showcase-item">
            <CoffeeCupArt iced syrup="babka" coldFoam size={76} />
            <div>
              <strong>Space Coast Coffee Bar</strong>
              <span>Hot &amp; iced brews, syrups &amp; cold foam</span>
            </div>
          </div>
          <div className="showcase-item">
            <BakeryItemArt pastry="cinnamon_roll" size={72} />
            <div>
              <strong>Fresh Hopkins Ave Bakery</strong>
              <span>Cinnamon rolls, muffins, cheddar bread &amp; croissants</span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="title-cta-grid">
          <button
            id="btn-start-campaign"
            className="primary-btn cta-large"
            onClick={() => {
              soundEngine.playTap();
              onOpenDays();
            }}
          >
            <span>☀️ 7-Day Shift Campaign</span>
            <small>Day {saveData.unlockedDay} Ready • Unlock Menu &amp; Stars</small>
          </button>

          <button
            id="btn-start-endless"
            className="accent-btn cta-large"
            onClick={() => {
              soundEngine.playTap();
              onStartEndless();
            }}
          >
            <span>🚀 Endless Rush Mode</span>
            <small>
              {saveData.endlessBestServed > 0
                ? `Best: ${saveData.endlessBestServed} Served • ${saveData.endlessBestCombo}× Combo`
                : '3 Lives • Serve as Many Customers as Possible!'}
            </small>
          </button>
        </div>

        <div className="title-secondary-row">
          <button
            id="btn-open-shop"
            className="secondary-btn"
            onClick={() => {
              soundEngine.playTap();
              onOpenShop();
            }}
          >
            🛠 Upgrade Shop (${saveData.coins})
          </button>
          <button
            id="btn-open-howto"
            className="secondary-btn"
            onClick={() => {
              soundEngine.playTap();
              setShowHowTo(true);
            }}
          >
            📖 How to Play
          </button>
        </div>
      </main>

      {showHowTo && (
        <div className="modal-backdrop">
          <div className="modal-card guide-modal">
            <h2>How to Run the Sunrise Counter</h2>
            <div className="guide-grid">
              <div className="guide-item">
                <BreakfastCupArt hasSausage hasEgg hasGravy cheddar biscuit size={58} />
                <div>
                  <h3>1. Craft Breakfast in a Cup</h3>
                  <p>
                    Tap <strong>Sausage</strong> and <strong>Egg</strong> to sizzle them on the griddle. Tap them when golden to scoop into a cup, ladle <strong>Gravy</strong>, and sprinkle <strong>Cheddar</strong> or <strong>Biscuit</strong> if ordered!
                  </p>
                </div>
              </div>
              <div className="guide-item">
                <CoffeeCupArt iced={false} syrup="caramel" coldFoam size={58} />
                <div>
                  <h3>2. Brew &amp; Mix Coffee</h3>
                  <p>
                    Tap <strong>Hot</strong> or <strong>Iced Coffee</strong>, then tap a syrup flavor (Vanilla, Caramel, Mocha, Babka) and/or <strong>Cold Foam</strong>.
                  </p>
                </div>
              </div>
              <div className="guide-item">
                <BakeryItemArt pastry="cheddar_bread" size={54} />
                <div>
                  <h3>3. Bake, Chain Combos &amp; Watch the Sky!</h3>
                  <p>
                    Tap any glowing <strong>SERVE!</strong> item (or drag it) to feed waiting customers. Shoo cheeky seagulls, wipe coffee spills, and ride <strong>Rocket Launch Rush</strong> waves for 2× tips!
                  </p>
                </div>
              </div>
            </div>
            <button className="primary-btn" onClick={() => setShowHowTo(false)}>
              Ready to Cook!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
