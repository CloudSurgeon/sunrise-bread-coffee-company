import type {
  BakeryKind,
  BreakfastCupItem,
  CustomerArchetype,
  DayConfig,
  MenuItem,
  SyrupFlavor,
  UpgradeDefinition,
} from '../types/game';

export interface SyrupMeta {
  id: SyrupFlavor;
  name: string;
  shortName: string;
  liquidColor: string;
  bottleColor: string;
  accentColor: string;
  unlockDay: number;
  priceBonus: number;
}

export const SYRUPS: Record<SyrupFlavor, SyrupMeta> = {
  plain: {
    id: 'plain',
    name: 'House Roast',
    shortName: 'Roast',
    liquidColor: '#5B341E',
    bottleColor: '#5B341E',
    accentColor: '#C59A73',
    unlockDay: 1,
    priceBonus: 0,
  },
  vanilla: {
    id: 'vanilla',
    name: 'Vanilla Bean',
    shortName: 'Vanilla',
    liquidColor: '#B88454',
    bottleColor: '#F5D88A',
    accentColor: '#FFF3C4',
    unlockDay: 1,
    priceBonus: 2,
  },
  caramel: {
    id: 'caramel',
    name: 'Salted Caramel',
    shortName: 'Caramel',
    liquidColor: '#C97A2B',
    bottleColor: '#E59535',
    accentColor: '#FFD699',
    unlockDay: 4,
    priceBonus: 3,
  },
  mocha: {
    id: 'mocha',
    name: 'Dark Mocha',
    shortName: 'Mocha',
    liquidColor: '#4A2518',
    bottleColor: '#7A422B',
    accentColor: '#D6A38A',
    unlockDay: 5,
    priceBonus: 3,
  },
  babka: {
    id: 'babka',
    name: 'Babka Spice',
    shortName: 'Babka',
    liquidColor: '#9C4D27',
    bottleColor: '#D9643A',
    accentColor: '#FFCCA8',
    unlockDay: 6,
    priceBonus: 4,
  },
};

export interface PastryMeta {
  id: BakeryKind;
  name: string;
  shortName: string;
  unlockDay: number;
  price: number;
  accentColor: string;
}

export const PASTRIES: Record<BakeryKind, PastryMeta> = {
  cinnamon_roll: {
    id: 'cinnamon_roll',
    name: 'Cinnamon Roll',
    shortName: 'Cinn. Roll',
    unlockDay: 1,
    price: 7,
    accentColor: '#D88B4B',
  },
  blueberry_muffin: {
    id: 'blueberry_muffin',
    name: 'Blueberry Muffin',
    shortName: 'Muffin',
    unlockDay: 2,
    price: 8,
    accentColor: '#5F6BD8',
  },
  cheddar_bread: {
    id: 'cheddar_bread',
    name: 'Cheddar Bread',
    shortName: 'Cheddar',
    unlockDay: 3,
    price: 9,
    accentColor: '#F2A32B',
  },
  croissant: {
    id: 'croissant',
    name: 'Butter Croissant',
    shortName: 'Croissant',
    unlockDay: 5,
    price: 10,
    accentColor: '#E8A849',
  },
};

export interface ArchetypeMeta {
  id: CustomerArchetype;
  title: string;
  names: string[];
  patienceSec: [number, number];
  tipMultiplier: number;
  tagline: string;
}

export const CUSTOMER_ARCHETYPES: Record<CustomerArchetype, ArchetypeMeta> = {
  engineer: {
    id: 'engineer',
    title: 'KSC Engineer',
    names: ['Maya', 'Devon', 'Priya', 'Carlos', 'Tessa'],
    patienceSec: [28, 34],
    tipMultiplier: 1.35,
    tagline: 'Loves Breakfast in a Cup & strong coffee. Tips big!',
  },
  surfer: {
    id: 'surfer',
    title: 'Beach Surfer',
    names: ['Kai', 'Sunny', 'Bodhi', 'Coral', 'Zack'],
    patienceSec: [36, 44],
    tipMultiplier: 1.15,
    tagline: 'Super chill patience. Craves iced coffee & pastries.',
  },
  commuter: {
    id: 'commuter',
    title: 'Morning Commuter',
    names: ['Elena', 'Marcus', 'Claire', 'Grant', 'Nora'],
    patienceSec: [21, 26],
    tipMultiplier: 1.25,
    tagline: 'In a hurry on US-1! Quick single orders for fast combos.',
  },
  tourist: {
    id: 'tourist',
    title: 'Launch Tourist',
    names: ['Barnaby', 'Lola', 'Gabe', 'Wendy', 'Rico'],
    patienceSec: [33, 40],
    tipMultiplier: 1.45,
    tagline: 'Visiting for the rocket launch! Big multi-item orders.',
  },
};

export const DAY_CONFIGS: DayConfig[] = [
  {
    day: 1,
    title: 'First Light on Hopkins Ave',
    subtitle: 'Master Breakfast in a Cup, Hot Coffee & Cinnamon Rolls',
    durationSec: 90,
    starTargets: [6, 10, 14],
    spawnIntervalMs: [5200, 7000],
    maxConcurrent: 3,
    maxOrderItems: 2,
    archetypes: ['engineer', 'commuter'],
    syrups: ['plain', 'vanilla'],
    allowIced: false,
    allowColdFoam: false,
    allowCheddar: false,
    allowBiscuit: false,
    pastries: ['cinnamon_roll'],
    enableSeagull: false,
    enableSpill: false,
    rocketEvents: [],
    newUnlocks: ['Breakfast in a Cup (Sausage + Egg + Gravy)', 'Hot Coffee & Vanilla', 'Cinnamon Roll'],
  },
  {
    day: 2,
    title: 'Cheddar & Muffin Morning',
    subtitle: 'Sprinkle shredded cheddar and bake fresh blueberry muffins',
    durationSec: 90,
    starTargets: [8, 12, 16],
    spawnIntervalMs: [4500, 6200],
    maxConcurrent: 3,
    maxOrderItems: 2,
    archetypes: ['engineer', 'surfer', 'commuter'],
    syrups: ['plain', 'vanilla'],
    allowIced: false,
    allowColdFoam: false,
    allowCheddar: true,
    allowBiscuit: false,
    pastries: ['cinnamon_roll', 'blueberry_muffin'],
    enableSeagull: false,
    enableSpill: true,
    rocketEvents: [],
    newUnlocks: ['Shredded Cheddar Topper', 'Blueberry Muffins', 'Beach Surfers'],
  },
  {
    day: 3,
    title: 'Indian River Breeze',
    subtitle: 'Cool down with Iced Coffee, Cold Foam & Sunrise Cheddar Bread',
    durationSec: 95,
    starTargets: [9, 13, 18],
    spawnIntervalMs: [4200, 5800],
    maxConcurrent: 4,
    maxOrderItems: 2,
    archetypes: ['engineer', 'surfer', 'commuter'],
    syrups: ['plain', 'vanilla'],
    allowIced: true,
    allowColdFoam: true,
    allowCheddar: true,
    allowBiscuit: false,
    pastries: ['cinnamon_roll', 'blueberry_muffin', 'cheddar_bread'],
    enableSeagull: true,
    enableSpill: true,
    rocketEvents: [],
    newUnlocks: ['Iced Coffee & Cold Foam', 'Cheddar Bread Slice', 'Cheeky Seagulls'],
  },
  {
    day: 4,
    title: 'Biscuits & Liftoff',
    subtitle: 'Launch tourists arrive! Add Biscuit Crumbles & Salted Caramel',
    durationSec: 95,
    starTargets: [10, 15, 20],
    spawnIntervalMs: [3900, 5400],
    maxConcurrent: 4,
    maxOrderItems: 3,
    archetypes: ['engineer', 'surfer', 'commuter', 'tourist'],
    syrups: ['plain', 'vanilla', 'caramel'],
    allowIced: true,
    allowColdFoam: true,
    allowCheddar: true,
    allowBiscuit: true,
    pastries: ['cinnamon_roll', 'blueberry_muffin', 'cheddar_bread'],
    enableSeagull: true,
    enableSpill: true,
    rocketEvents: [48],
    newUnlocks: ['Biscuit Crumbles Topper', 'Salted Caramel Syrup', 'Rocket Launch Rush (2× Tips!)'],
  },
  {
    day: 5,
    title: 'Space Coast Espresso',
    subtitle: 'Dark Mocha lattes & flaky croissants during peak commute',
    durationSec: 100,
    starTargets: [11, 16, 22],
    spawnIntervalMs: [3600, 5000],
    maxConcurrent: 4,
    maxOrderItems: 3,
    archetypes: ['engineer', 'surfer', 'commuter', 'tourist'],
    syrups: ['plain', 'vanilla', 'caramel', 'mocha'],
    allowIced: true,
    allowColdFoam: true,
    allowCheddar: true,
    allowBiscuit: true,
    pastries: ['cinnamon_roll', 'blueberry_muffin', 'cheddar_bread', 'croissant'],
    enableSeagull: true,
    enableSpill: true,
    rocketEvents: [54],
    newUnlocks: ['Dark Mocha Syrup', 'Buttery Croissants'],
  },
  {
    day: 6,
    title: 'Babka Launch Day',
    subtitle: 'Sunrise signature Babka Spice lattes & twin launch windows!',
    durationSec: 105,
    starTargets: [13, 18, 24],
    spawnIntervalMs: [3300, 4600],
    maxConcurrent: 4,
    maxOrderItems: 3,
    archetypes: ['engineer', 'surfer', 'commuter', 'tourist'],
    syrups: ['plain', 'vanilla', 'caramel', 'mocha', 'babka'],
    allowIced: true,
    allowColdFoam: true,
    allowCheddar: true,
    allowBiscuit: true,
    pastries: ['cinnamon_roll', 'blueberry_muffin', 'cheddar_bread', 'croissant'],
    enableSeagull: true,
    enableSpill: true,
    rocketEvents: [70, 32],
    newUnlocks: ['Signature Babka Spice Syrup', 'Twin Rocket Launch Rush'],
  },
  {
    day: 7,
    title: 'Titusville Grand Sunrise Rush',
    subtitle: 'The full Space Coast menu at blazing weekend bakery speed!',
    durationSec: 110,
    starTargets: [15, 21, 28],
    spawnIntervalMs: [3000, 4200],
    maxConcurrent: 4,
    maxOrderItems: 3,
    archetypes: ['engineer', 'surfer', 'commuter', 'tourist'],
    syrups: ['plain', 'vanilla', 'caramel', 'mocha', 'babka'],
    allowIced: true,
    allowColdFoam: true,
    allowCheddar: true,
    allowBiscuit: true,
    pastries: ['cinnamon_roll', 'blueberry_muffin', 'cheddar_bread', 'croissant'],
    enableSeagull: true,
    enableSpill: true,
    rocketEvents: [78, 36],
    newUnlocks: ['Master Barista & Chef Challenge'],
  },
];

export const ENDLESS_BASE_CONFIG: DayConfig = {
  day: 0,
  title: 'Endless Sunrise Rush',
  subtitle: 'Serve as many customers as possible — 3 walk-outs ends the shift!',
  durationSec: 9999,
  starTargets: [10, 20, 35],
  spawnIntervalMs: [4300, 5600],
  maxConcurrent: 4,
  maxOrderItems: 3,
  archetypes: ['engineer', 'surfer', 'commuter', 'tourist'],
  syrups: ['plain', 'vanilla', 'caramel', 'mocha', 'babka'],
  allowIced: true,
  allowColdFoam: true,
  allowCheddar: true,
  allowBiscuit: true,
  pastries: ['cinnamon_roll', 'blueberry_muffin', 'cheddar_bread', 'croissant'],
  enableSeagull: true,
  enableSpill: true,
  rocketEvents: [],
  newUnlocks: [],
};

export const UPGRADE_CATALOG: UpgradeDefinition[] = [
  {
    id: 'griddle_slots',
    name: 'Extra Griddle Burners',
    station: 'breakfast',
    description: 'Cook more sausage & eggs at once for Breakfast in a Cup.',
    maxLevel: 2,
    costs: [90, 220],
    levelLabels: ['2 Burners', '3 Burners', '4 Burners'],
    badge: 'CAPACITY',
  },
  {
    id: 'griddle_speed',
    name: 'Cast-Iron Sear Heat',
    station: 'breakfast',
    description: 'Sausage and eggs reach golden perfection much faster.',
    maxLevel: 3,
    costs: [75, 160, 280],
    levelLabels: ['3.8s', '3.0s', '2.3s', '1.7s'],
    badge: 'SPEED',
  },
  {
    id: 'burn_shield',
    name: 'Nonstick Burn-Shield',
    station: 'breakfast',
    description: 'More than doubles the safe window before griddle food burns.',
    maxLevel: 2,
    costs: [110, 240],
    levelLabels: ['Standard', '+5s Buffer', 'No-Burn Safe'],
    badge: 'SAFETY',
  },
  {
    id: 'cup_slots',
    name: 'Extra Cup Prep Mats',
    station: 'breakfast',
    description: 'Stage more Breakfast in a Cup orders side by side.',
    maxLevel: 2,
    costs: [85, 200],
    levelLabels: ['2 Mats', '3 Mats', '4 Mats'],
    badge: 'PREP',
  },
  {
    id: 'coffee_slots',
    name: 'Multi-Head Espresso Bar',
    station: 'coffee',
    description: 'Brew additional hot & iced coffees simultaneously.',
    maxLevel: 2,
    costs: [85, 210],
    levelLabels: ['2 Spouts', '3 Spouts', '4 Spouts'],
    badge: 'CAPACITY',
  },
  {
    id: 'coffee_speed',
    name: 'Turbo Barista Boiler',
    station: 'coffee',
    description: 'Pulls rich Sunrise espresso & cold brews in a flash.',
    maxLevel: 3,
    costs: [70, 150, 260],
    levelLabels: ['3.0s', '2.3s', '1.7s', '1.2s'],
    badge: 'SPEED',
  },
  {
    id: 'oven_slots',
    name: 'Deck Bakery Oven Racks',
    station: 'bakery',
    description: 'Warm up more cinnamon rolls, muffins, bread & croissants.',
    maxLevel: 2,
    costs: [80, 195],
    levelLabels: ['2 Racks', '3 Racks', '4 Racks'],
    badge: 'CAPACITY',
  },
  {
    id: 'pastry_warmer',
    name: 'Heat-Lamp Pastry Warmer',
    station: 'bakery',
    description: 'Keeps baked goods golden & warm forever—zero overbaking!',
    maxLevel: 1,
    costs: [150],
    levelLabels: ['Off', 'Always Warm'],
    badge: 'SAFETY',
  },
  {
    id: 'cozy_decor',
    name: 'Hopkins Ave Cozy Decor',
    station: 'decor',
    description: 'Sunlit plants, space art & tip jar boost patience and tips.',
    maxLevel: 3,
    costs: [95, 190, 320],
    levelLabels: ['Cozy', '+15% Patience & Tips', '+30% Patience & Tips', '+45% Patience & Tips'],
    badge: 'TIPS',
  },
];

export function isCupComplete(cup: Pick<BreakfastCupItem, 'hasSausage' | 'hasEgg' | 'hasGravy'>): boolean {
  return cup.hasSausage && cup.hasEgg && cup.hasGravy;
}

export function getItemSignature(item: MenuItem): string {
  if (item.kind === 'breakfast_cup') {
    return `cup:${item.hasSausage ? 1 : 0}:${item.hasEgg ? 1 : 0}:${item.hasGravy ? 1 : 0}:${item.cheddar ? 'C' : ''}:${item.biscuit ? 'B' : ''}`;
  }
  if (item.kind === 'coffee') {
    return `coffee:${item.iced ? 'iced' : 'hot'}:${item.syrup}:${item.coldFoam ? 'foam' : 'no'}`;
  }
  return `bakery:${item.pastry}`;
}

export function itemsMatch(a: MenuItem, b: MenuItem): boolean {
  return getItemSignature(a) === getItemSignature(b);
}

export function getItemBasePrice(item: MenuItem): number {
  if (item.kind === 'breakfast_cup') {
    return 14 + (item.cheddar ? 2 : 0) + (item.biscuit ? 3 : 0);
  }
  if (item.kind === 'coffee') {
    return 6 + SYRUPS[item.syrup].priceBonus + (item.iced ? 1 : 0) + (item.coldFoam ? 2 : 0);
  }
  return PASTRIES[item.pastry].price;
}

export function getItemTitle(item: MenuItem): string {
  if (item.kind === 'breakfast_cup') {
    const extras: string[] = [];
    if (item.cheddar) extras.push('Cheddar');
    if (item.biscuit) extras.push('Biscuit');
    return extras.length > 0 ? `Breakfast Cup + ${extras.join(' & ')}` : 'Breakfast in a Cup';
  }
  if (item.kind === 'coffee') {
    const parts: string[] = [];
    if (item.iced) parts.push('Iced');
    parts.push(SYRUPS[item.syrup].shortName);
    parts.push('Coffee');
    if (item.coldFoam) parts.push('+ Foam');
    return parts.join(' ');
  }
  return PASTRIES[item.pastry].name;
}
