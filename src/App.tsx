import React, { useEffect, useState } from 'react';
import { soundEngine } from './audio/soundEngine';
import { DaySelect } from './components/DaySelect';
import { GameScreen } from './components/GameScreen';
import { ShiftSummary } from './components/ShiftSummary';
import { TitleScreen } from './components/TitleScreen';
import { UpgradeShop } from './components/UpgradeShop';
import { DAY_CONFIGS } from './data/menuAndDays';
import { loadSaveData, persistSaveData } from './storage/saveData';
import type { GameMode, SaveData, ScreenState, ShiftResult, UpgradeId } from './types/game';

export const App: React.FC = () => {
  const [saveData, setSaveData] = useState<SaveData>(() => loadSaveData());
  const [screen, setScreen] = useState<ScreenState>('title');
  const [shopReturnTo, setShopReturnTo] = useState<'title' | 'day-select' | 'summary'>('title');
  const [activeMode, setActiveMode] = useState<GameMode>('shift');
  const [activeDay, setActiveDay] = useState<number>(1);
  const [shiftKey, setShiftKey] = useState<number>(0);
  const [lastResult, setLastResult] = useState<ShiftResult | null>(null);

  useEffect(() => {
    soundEngine.setMuted(saveData.muted);
    persistSaveData(saveData);
  }, [saveData]);

  const handleToggleMute = () => {
    setSaveData((prev) => ({ ...prev, muted: !prev.muted }));
  };

  const startShift = (mode: GameMode, day = 1) => {
    setActiveMode(mode);
    setActiveDay(day);
    setShiftKey((k) => k + 1);
    setScreen('playing');
  };

  const handleOpenShop = (from: 'title' | 'day-select' | 'summary') => {
    setShopReturnTo(from);
    setScreen('shop');
  };

  const handleBuyUpgrade = (id: UpgradeId, cost: number) => {
    setSaveData((prev) => {
      if (prev.coins < cost) return prev;
      return {
        ...prev,
        coins: prev.coins - cost,
        upgrades: {
          ...prev.upgrades,
          [id]: (prev.upgrades[id] ?? 0) + 1,
        },
      };
    });
  };

  const handleFinishShift = (result: ShiftResult) => {
    setLastResult(result);
    setSaveData((prev) => {
      const next: SaveData = {
        ...prev,
        coins: prev.coins + result.coinsEarned,
        tutorialSeen: true,
        dayStars: { ...prev.dayStars },
        dayBestServed: { ...prev.dayBestServed },
      };

      if (result.mode === 'shift') {
        const oldStars = prev.dayStars[result.dayNumber] ?? 0;
        next.dayStars[result.dayNumber] = Math.max(oldStars, result.starsEarned);
        const oldBest = prev.dayBestServed[result.dayNumber] ?? 0;
        next.dayBestServed[result.dayNumber] = Math.max(oldBest, result.servedCount);
        if (result.passed && result.dayNumber >= prev.unlockedDay) {
          next.unlockedDay = Math.min(DAY_CONFIGS.length, result.dayNumber + 1);
        }
      } else {
        next.endlessBestServed = Math.max(prev.endlessBestServed, result.servedCount);
        next.endlessBestCoins = Math.max(prev.endlessBestCoins, result.coinsEarned);
        next.endlessBestCombo = Math.max(prev.endlessBestCombo, result.maxCombo);
      }

      return next;
    });
    setScreen('summary');
  };

  if (screen === 'playing') {
    return (
      <GameScreen
        key={`${activeMode}_${activeDay}_${shiftKey}`}
        mode={activeMode}
        dayNumber={activeDay}
        saveData={saveData}
        onToggleMute={handleToggleMute}
        onExit={() => setScreen(activeMode === 'shift' ? 'day-select' : 'title')}
        onFinish={handleFinishShift}
      />
    );
  }

  if (screen === 'day-select') {
    return (
      <DaySelect
        saveData={saveData}
        onSelectDay={(day) => startShift('shift', day)}
        onOpenShop={() => handleOpenShop('day-select')}
        onBack={() => setScreen('title')}
      />
    );
  }

  if (screen === 'shop') {
    return (
      <UpgradeShop
        saveData={saveData}
        onBuyUpgrade={handleBuyUpgrade}
        onBack={() => setScreen(shopReturnTo)}
      />
    );
  }

  if (screen === 'summary' && lastResult) {
    return (
      <ShiftSummary
        result={lastResult}
        saveData={saveData}
        onNextDay={() => startShift('shift', Math.min(DAY_CONFIGS.length, lastResult.dayNumber + 1))}
        onReplay={() => startShift(lastResult.mode, lastResult.dayNumber)}
        onOpenShop={() => handleOpenShop('summary')}
        onMainMenu={() => setScreen('title')}
      />
    );
  }

  return (
    <TitleScreen
      saveData={saveData}
      onOpenDays={() => setScreen('day-select')}
      onStartEndless={() => startShift('endless', 0)}
      onOpenShop={() => handleOpenShop('title')}
      onToggleMute={handleToggleMute}
    />
  );
};

export default App;
