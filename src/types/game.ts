export type GameMode = 'shift' | 'endless';

export type ScreenState = 'title' | 'day-select' | 'shop' | 'playing' | 'summary';

export type SyrupFlavor = 'plain' | 'vanilla' | 'caramel' | 'mocha' | 'babka';

export type BakeryKind =
  | 'cinnamon_roll'
  | 'blueberry_muffin'
  | 'cheddar_bread'
  | 'croissant';

export interface BreakfastCupItem {
  kind: 'breakfast_cup';
  hasSausage: boolean;
  hasEgg: boolean;
  hasGravy: boolean;
  cheddar: boolean;
  biscuit: boolean;
}

export interface CoffeeItem {
  kind: 'coffee';
  iced: boolean;
  syrup: SyrupFlavor;
  coldFoam: boolean;
}

export interface BakeryItem {
  kind: 'bakery';
  pastry: BakeryKind;
}

export type MenuItem = BreakfastCupItem | CoffeeItem | BakeryItem;

export type CustomerArchetype = 'engineer' | 'surfer' | 'commuter' | 'tourist';

export interface OrderEntry {
  id: string;
  item: MenuItem;
  fulfilled: boolean;
}

export interface Customer {
  id: string;
  slotIndex: number;
  archetype: CustomerArchetype;
  name: string;
  variant: number;
  orders: OrderEntry[];
  patience: number;
  maxPatience: number;
  tipMultiplier: number;
  mood: 'happy' | 'waiting' | 'impatient' | 'leaving' | 'served';
  servedBonus?: number;
}

export interface CoffeeSlot {
  id: number;
  state: 'empty' | 'brewing' | 'ready';
  progress: number;
  iced: boolean;
  syrup: SyrupFlavor;
  coldFoam: boolean;
}

export interface GriddleSlot {
  id: number;
  food: 'sausage' | 'egg' | null;
  state: 'empty' | 'cooking' | 'ready' | 'burnt';
  progress: number;
  burnProgress: number;
}

export interface CupPrepSlot {
  id: number;
  active: boolean;
  hasSausage: boolean;
  hasEgg: boolean;
  hasGravy: boolean;
  cheddar: boolean;
  biscuit: boolean;
}

export interface OvenSlot {
  id: number;
  pastry: BakeryKind | null;
  state: 'empty' | 'baking' | 'ready' | 'burnt';
  progress: number;
  burnProgress: number;
}

export interface CounterHazard {
  id: string;
  type: 'seagull' | 'spill';
  slotIndex?: number;
  xPercent: number;
  tapsRemaining: number;
}

export interface FloatingFeedback {
  id: string;
  text: string;
  subtext?: string;
  x: number;
  y: number;
  tone: 'gold' | 'combo' | 'good' | 'warn' | 'rocket';
}

export type UpgradeId =
  | 'griddle_slots'
  | 'griddle_speed'
  | 'burn_shield'
  | 'coffee_slots'
  | 'coffee_speed'
  | 'cup_slots'
  | 'oven_slots'
  | 'pastry_warmer'
  | 'cozy_decor';

export interface UpgradeDefinition {
  id: UpgradeId;
  name: string;
  station: 'breakfast' | 'coffee' | 'bakery' | 'decor';
  description: string;
  maxLevel: number;
  costs: number[];
  levelLabels: string[];
  badge: string;
}

export interface DayConfig {
  day: number;
  title: string;
  subtitle: string;
  durationSec: number;
  starTargets: [number, number, number];
  spawnIntervalMs: [number, number];
  maxConcurrent: number;
  maxOrderItems: number;
  archetypes: CustomerArchetype[];
  syrups: SyrupFlavor[];
  allowIced: boolean;
  allowColdFoam: boolean;
  allowCheddar: boolean;
  allowBiscuit: boolean;
  pastries: BakeryKind[];
  enableSeagull: boolean;
  enableSpill: boolean;
  rocketEvents: number[];
  newUnlocks: string[];
}

export interface SaveData {
  coins: number;
  unlockedDay: number;
  dayStars: Record<number, number>;
  dayBestServed: Record<number, number>;
  upgrades: Record<UpgradeId, number>;
  endlessBestServed: number;
  endlessBestCoins: number;
  endlessBestCombo: number;
  muted: boolean;
  tutorialSeen: boolean;
}

export interface ShiftResult {
  mode: GameMode;
  dayNumber: number;
  servedCount: number;
  ordersDelivered: number;
  coinsEarned: number;
  tipsEarned: number;
  maxCombo: number;
  angryWalkouts: number;
  starsEarned: number;
  passed: boolean;
  isNewBest: boolean;
}

export interface PlayerStats {
  griddleSlots: number;
  griddleCookSec: number;
  griddleBurnSec: number;
  coffeeSlots: number;
  coffeeBrewSec: number;
  cupSlots: number;
  ovenSlots: number;
  ovenBakeSec: number;
  pastryWarmer: boolean;
  ovenBurnSec: number;
  patienceMultiplier: number;
  tipBonusMultiplier: number;
}
