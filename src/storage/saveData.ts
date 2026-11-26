import type { PlayerStats, SaveData, UpgradeId } from '../types/game';

const STORAGE_KEY = 'sunrise_bread_coffee_v1';

const DEFAULT_UPGRADES: Record<UpgradeId, number> = {
  griddle_slots: 0,
  griddle_speed: 0,
  burn_shield: 0,
  coffee_slots: 0,
  coffee_speed: 0,
  cup_slots: 0,
  oven_slots: 0,
  pastry_warmer: 0,
  cozy_decor: 0,
};

export function getDefaultSaveData(): SaveData {
  return {
    coins: 0,
    unlockedDay: 1,
    dayStars: {},
    dayBestServed: {},
    upgrades: { ...DEFAULT_UPGRADES },
    endlessBestServed: 0,
    endlessBestCoins: 0,
    endlessBestCombo: 0,
    muted: false,
    tutorialSeen: false,
  };
}

export function loadSaveData(): SaveData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultSaveData();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const defaults = getDefaultSaveData();
    return {
      ...defaults,
      ...parsed,
      upgrades: {
        ...DEFAULT_UPGRADES,
        ...(parsed.upgrades ?? {}),
      },
      dayStars: parsed.dayStars ?? {},
      dayBestServed: parsed.dayBestServed ?? {},
    };
  } catch {
    return getDefaultSaveData();
  }
}

export function persistSaveData(data: SaveData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore quota/storage errors in private contexts
  }
}

export function getPlayerStats(upgrades: Record<UpgradeId, number>): PlayerStats {
  const griddleSpeedTable = [3.8, 3.0, 2.3, 1.7];
  const coffeeSpeedTable = [3.0, 2.3, 1.7, 1.2];
  const burnTable = [7.5, 13.0, 9999];
  const decorPatienceTable = [1.0, 1.15, 1.3, 1.45];
  const decorTipTable = [1.0, 1.15, 1.3, 1.45];

  const gSpeedLvl = Math.min(upgrades.griddle_speed ?? 0, 3);
  const cSpeedLvl = Math.min(upgrades.coffee_speed ?? 0, 3);
  const bShieldLvl = Math.min(upgrades.burn_shield ?? 0, 2);
  const decorLvl = Math.min(upgrades.cozy_decor ?? 0, 3);

  return {
    griddleSlots: 2 + Math.min(upgrades.griddle_slots ?? 0, 2),
    griddleCookSec: griddleSpeedTable[gSpeedLvl],
    griddleBurnSec: burnTable[bShieldLvl],
    coffeeSlots: 2 + Math.min(upgrades.coffee_slots ?? 0, 2),
    coffeeBrewSec: coffeeSpeedTable[cSpeedLvl],
    cupSlots: 2 + Math.min(upgrades.cup_slots ?? 0, 2),
    ovenSlots: 2 + Math.min(upgrades.oven_slots ?? 0, 2),
    ovenBakeSec: 3.4 - Math.min(upgrades.oven_slots ?? 0, 2) * 0.25,
    pastryWarmer: (upgrades.pastry_warmer ?? 0) >= 1,
    ovenBurnSec: (upgrades.pastry_warmer ?? 0) >= 1 ? 9999 : 11.0,
    patienceMultiplier: decorPatienceTable[decorLvl],
    tipBonusMultiplier: decorTipTable[decorLvl],
  };
}
