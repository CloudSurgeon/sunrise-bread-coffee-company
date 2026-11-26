import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import {
  CUSTOMER_ARCHETYPES,
  DAY_CONFIGS,
  ENDLESS_BASE_CONFIG,
  PASTRIES,
  SYRUPS,
  getItemBasePrice,
  getItemTitle,
  isCupComplete,
  itemsMatch,
} from '../data/menuAndDays';
import { getPlayerStats } from '../storage/saveData';
import type {
  BakeryKind,
  CoffeeItem,
  CoffeeSlot,
  CounterHazard,
  CupPrepSlot,
  Customer,
  CustomerArchetype,
  DayConfig,
  FloatingFeedback,
  GameMode,
  GriddleSlot,
  MenuItem,
  OrderEntry,
  OvenSlot,
  SaveData,
  ShiftResult,
  SyrupFlavor,
} from '../types/game';
import {
  BakeryItemArt,
  BreakfastCupArt,
  CoffeeCupArt,
  CoffeeSpillArt,
  CustomerAvatar,
  OrderItemArt,
  SeagullArt,
  TitusvilleWindow,
} from './Art';

interface GameScreenProps {
  mode: GameMode;
  dayNumber: number;
  saveData: SaveData;
  onToggleMute: () => void;
  onExit: () => void;
  onFinish: (result: ShiftResult) => void;
}

type DragPayload =
  | { source: 'cup'; slotId: number }
  | { source: 'coffee'; slotId: number }
  | { source: 'oven'; slotId: number };

let uidCounter = 1;
const nextUid = (prefix: string) => `${prefix}_${uidCounter++}`;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildOrderForCustomer(
  archetype: CustomerArchetype,
  config: DayConfig,
  endlessServed: number
): OrderEntry[] {
  const maxItems =
    config.day === 0
      ? endlessServed < 4
        ? 1
        : endlessServed < 12
          ? 2
          : 3
      : config.maxOrderItems;

  let itemCount = 1;
  if (archetype === 'commuter') {
    itemCount = Math.random() < 0.78 ? 1 : Math.min(2, maxItems);
  } else if (archetype === 'tourist') {
    itemCount = maxItems >= 3 && Math.random() < 0.55 ? 3 : Math.min(2, maxItems);
  } else {
    const r = Math.random();
    if (maxItems >= 3 && r > 0.75) itemCount = 3;
    else if (maxItems >= 2 && r > 0.35) itemCount = 2;
  }

  const makeBreakfastCup = (): MenuItem => ({
    kind: 'breakfast_cup',
    hasSausage: true,
    hasEgg: true,
    hasGravy: true,
    cheddar: config.allowCheddar && Math.random() < 0.52,
    biscuit: config.allowBiscuit && Math.random() < 0.45,
  });

  const makeCoffee = (): MenuItem => {
    const preferIced = archetype === 'surfer' ? 0.7 : 0.42;
    const iced = config.allowIced && Math.random() < preferIced;
    const syrup =
      config.syrups.length > 1 && Math.random() < 0.68
        ? pickRandom(config.syrups.filter((s) => s !== 'plain'))
        : 'plain';
    const coldFoam = config.allowColdFoam && Math.random() < (iced ? 0.58 : 0.3);
    return { kind: 'coffee', iced, syrup, coldFoam };
  };

  const makeBakery = (): MenuItem => ({
    kind: 'bakery',
    pastry: pickRandom(config.pastries),
  });

  const entries: OrderEntry[] = [];
  for (let i = 0; i < itemCount; i++) {
    let item: MenuItem;
    const roll = Math.random();
    if (i === 0 && archetype === 'engineer') {
      item = roll < 0.55 ? makeBreakfastCup() : makeCoffee();
    } else if (i === 0 && archetype === 'surfer') {
      item = roll < 0.48 ? makeCoffee() : roll < 0.78 ? makeBakery() : makeBreakfastCup();
    } else if (i === 1 && entries[0].item.kind === 'breakfast_cup') {
      item = roll < 0.7 ? makeCoffee() : makeBakery();
    } else {
      if (roll < 0.4) item = makeBreakfastCup();
      else if (roll < 0.74) item = makeCoffee();
      else item = makeBakery();
    }
    entries.push({ id: nextUid('ord'), item, fulfilled: false });
  }

  return entries;
}

function createInitialCoffeeSlots(count: number): CoffeeSlot[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    state: 'empty',
    progress: 0,
    iced: false,
    syrup: 'plain',
    coldFoam: false,
  }));
}

function createInitialGriddleSlots(count: number): GriddleSlot[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    food: null,
    state: 'empty',
    progress: 0,
    burnProgress: 0,
  }));
}

function createInitialCupSlots(count: number): CupPrepSlot[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    active: false,
    hasSausage: false,
    hasEgg: false,
    hasGravy: false,
    cheddar: false,
    biscuit: false,
  }));
}

function createInitialOvenSlots(count: number): OvenSlot[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    pastry: null,
    state: 'empty',
    progress: 0,
    burnProgress: 0,
  }));
}

export const GameScreen: React.FC<GameScreenProps> = ({
  mode,
  dayNumber,
  saveData,
  onToggleMute,
  onExit,
  onFinish,
}) => {
  const config = useMemo<DayConfig>(() => {
    if (mode === 'endless') return ENDLESS_BASE_CONFIG;
    return DAY_CONFIGS.find((d) => d.day === dayNumber) ?? DAY_CONFIGS[0];
  }, [mode, dayNumber]);

  const stats = useMemo(() => getPlayerStats(saveData.upgrades), [saveData.upgrades]);

  const [paused, setPaused] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(mode === 'shift' ? config.durationSec : 0);
  const [elapsedSec, setElapsedSec] = useState<number>(0);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coffeeSlots, setCoffeeSlots] = useState<CoffeeSlot[]>(() => createInitialCoffeeSlots(stats.coffeeSlots));
  const [griddleSlots, setGriddleSlots] = useState<GriddleSlot[]>(() => createInitialGriddleSlots(stats.griddleSlots));
  const [cupSlots, setCupSlots] = useState<CupPrepSlot[]>(() => createInitialCupSlots(stats.cupSlots));
  const [ovenSlots, setOvenSlots] = useState<OvenSlot[]>(() => createInitialOvenSlots(stats.ovenSlots));

  const [selectedCupId, setSelectedCupId] = useState<number | null>(null);
  const [selectedCoffeeId, setSelectedCoffeeId] = useState<number | null>(null);
  const [hazards, setHazards] = useState<CounterHazard[]>([]);
  const [feedbacks, setFeedbacks] = useState<FloatingFeedback[]>([]);

  const [servedCount, setServedCount] = useState(0);
  const [ordersDelivered, setOrdersDelivered] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [tipsEarned, setTipsEarned] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [angryWalkouts, setAngryWalkouts] = useState(0);

  const [rocketRushLeft, setRocketRushLeft] = useState(0);
  const [rocketProgress, setRocketProgress] = useState(0);
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [trashHover, setTrashHover] = useState(false);

  // Refs for fresh state inside fixed-step loop & callbacks
  const finishedRef = useRef(false);
  const lastServeAtRef = useRef<number>(0);
  const nextSpawnTimerRef = useRef<number>(1.0);
  const nextHazardTimerRef = useRef<number>(15);
  const firedRocketsRef = useRef<Set<number>>(new Set());
  const nextEndlessRocketRef = useRef<number>(42);

  const stateRef = useRef({
    paused,
    showGuide,
    timeLeft,
    elapsedSec,
    customers,
    servedCount,
    ordersDelivered,
    coinsEarned,
    tipsEarned,
    combo,
    maxCombo,
    angryWalkouts,
    rocketRushLeft,
    hazards,
  });

  useEffect(() => {
    stateRef.current = {
      paused,
      showGuide,
      timeLeft,
      elapsedSec,
      customers,
      servedCount,
      ordersDelivered,
      coinsEarned,
      tipsEarned,
      combo,
      maxCombo,
      angryWalkouts,
      rocketRushLeft,
      hazards,
    };
  });

  const pushFeedback = useCallback(
    (text: string, tone: FloatingFeedback['tone'], x = 50, y = 42, subtext?: string) => {
      const id = nextUid('fb');
      setFeedbacks((prev) => [...prev.slice(-8), { id, text, subtext, x, y, tone }]);
      window.setTimeout(() => {
        setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      }, 1150);
    },
    []
  );

  const triggerFinish = useCallback(
    (finalOverrides?: Partial<Pick<ShiftResult, 'angryWalkouts' | 'servedCount' | 'coinsEarned' | 'tipsEarned' | 'ordersDelivered' | 'maxCombo'>>) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const cur = stateRef.current;
      const finalServed = finalOverrides?.servedCount ?? cur.servedCount;
      const finalWalkouts = finalOverrides?.angryWalkouts ?? cur.angryWalkouts;
      const finalCoins = finalOverrides?.coinsEarned ?? cur.coinsEarned;
      const finalTips = finalOverrides?.tipsEarned ?? cur.tipsEarned;
      const finalOrders = finalOverrides?.ordersDelivered ?? cur.ordersDelivered;
      const finalCombo = finalOverrides?.maxCombo ?? cur.maxCombo;

      let starsEarned = 0;
      if (finalServed >= config.starTargets[2]) starsEarned = 3;
      else if (finalServed >= config.starTargets[1]) starsEarned = 2;
      else if (finalServed >= config.starTargets[0]) starsEarned = 1;

      const passed = mode === 'endless' ? finalServed > 0 : starsEarned >= 1;
      const prevBest =
        mode === 'endless'
          ? saveData.endlessBestServed
          : (saveData.dayBestServed[dayNumber] ?? 0);
      const isNewBest = finalServed > prevBest;

      soundEngine.playShiftEnd(passed);
      onFinish({
        mode,
        dayNumber,
        servedCount: finalServed,
        ordersDelivered: finalOrders,
        coinsEarned: finalCoins,
        tipsEarned: finalTips,
        maxCombo: finalCombo,
        angryWalkouts: finalWalkouts,
        starsEarned,
        passed,
        isNewBest,
      });
    },
    [config.starTargets, dayNumber, mode, onFinish, saveData.dayBestServed, saveData.endlessBestServed]
  );

  const spawnCustomer = useCallback(() => {
    const cur = stateRef.current;
    const activeCustomers = cur.customers.filter((c) => c.mood !== 'leaving');
    const maxSlots = config.maxConcurrent;
    if (activeCustomers.length >= maxSlots) return;

    // Find open counter slots (avoid seagull-occupied slot if possible)
    const occupied = new Set(cur.customers.map((c) => c.slotIndex));
    const seagullSlot = cur.hazards.find((h) => h.type === 'seagull')?.slotIndex;
    const openSlots = [0, 1, 2, 3].filter((idx) => !occupied.has(idx) && idx !== seagullSlot);
    if (openSlots.length === 0) return;

    const slotIndex = pickRandom(openSlots);
    const archetype = pickRandom(config.archetypes);
    const meta = CUSTOMER_ARCHETYPES[archetype];
    const [minP, maxP] = meta.patienceSec;
    const endlessTighten = mode === 'endless' ? Math.max(0.72, 1 - cur.servedCount * 0.008) : 1;
    const maxPatience = (minP + Math.random() * (maxP - minP)) * stats.patienceMultiplier * endlessTighten;

    const customer: Customer = {
      id: nextUid('cust'),
      slotIndex,
      archetype,
      name: pickRandom(meta.names),
      variant: Math.floor(Math.random() * 10),
      orders: buildOrderForCustomer(archetype, config, cur.servedCount),
      patience: maxPatience,
      maxPatience,
      tipMultiplier: meta.tipMultiplier,
      mood: 'waiting',
    };

    setCustomers((prev) => [...prev, customer]);
  }, [config, mode, stats.patienceMultiplier]);

  // Spawn initial customer quickly at start
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!finishedRef.current) spawnCustomer();
    }, 550);
    return () => window.clearTimeout(t);
  }, [spawnCustomer]);

  // Fixed-step game simulation tick (100ms = 10Hz smooth, low overhead)
  useEffect(() => {
    const DT = 0.1;
    const interval = window.setInterval(() => {
      const cur = stateRef.current;
      if (cur.paused || cur.showGuide || finishedRef.current) return;

      // 1. Shift Clock / Elapsed
      if (mode === 'shift') {
        const nextTime = Math.max(0, Number((cur.timeLeft - DT).toFixed(2)));
        setTimeLeft(nextTime);

        // Check Rocket Launch scheduled events
        for (const triggerAt of config.rocketEvents) {
          if (nextTime <= triggerAt && !firedRocketsRef.current.has(triggerAt)) {
            firedRocketsRef.current.add(triggerAt);
            setRocketRushLeft(16);
            setRocketProgress(0.01);
            soundEngine.playRocketLaunch();
            pushFeedback('🚀 ROCKET LAUNCH RUSH!', 'rocket', 50, 26, '2× Tips for 16s!');
            spawnCustomer();
          }
        }

        if (nextTime <= 0) {
          triggerFinish();
          return;
        }
      } else {
        const nextElapsed = Number((cur.elapsedSec + DT).toFixed(2));
        setElapsedSec(nextElapsed);
        if (nextElapsed >= nextEndlessRocketRef.current) {
          nextEndlessRocketRef.current += 48;
          setRocketRushLeft(16);
          setRocketProgress(0.01);
          soundEngine.playRocketLaunch();
          pushFeedback('🚀 ROCKET LAUNCH RUSH!', 'rocket', 50, 26, '2× Tips for 16s!');
          spawnCustomer();
        }
      }

      // 2. Rocket Rush Animation
      if (cur.rocketRushLeft > 0) {
        setRocketRushLeft((r) => Math.max(0, Number((r - DT).toFixed(2))));
        setRocketProgress((p) => Math.min(1.15, p + DT * 0.11));
      } else {
        setRocketProgress(0);
      }

      // 3. Combo timeout decay (6.5 seconds between served customers)
      if (cur.combo > 0 && Date.now() - lastServeAtRef.current > 6500) {
        setCombo(0);
      }

      // 4. Spawn timer
      nextSpawnTimerRef.current -= DT;
      if (nextSpawnTimerRef.current <= 0) {
        spawnCustomer();
        const [minMs, maxMs] = config.spawnIntervalMs;
        const rushMult = cur.rocketRushLeft > 0 ? 0.68 : 1;
        const endlessSpeedup = mode === 'endless' ? Math.max(0.54, 1 - cur.servedCount * 0.018) : 1;
        const delaySec = ((minMs + Math.random() * (maxMs - minMs)) / 1000) * rushMult * endlessSpeedup;
        nextSpawnTimerRef.current = Math.max(1.5, delaySec);
      }

      // 5. Titusville Counter Hazards (Seagull & Spill)
      if (config.enableSeagull || config.enableSpill) {
        nextHazardTimerRef.current -= DT;
        if (nextHazardTimerRef.current <= 0 && cur.hazards.length === 0) {
          const canSeagull = config.enableSeagull;
          const canSpill = config.enableSpill;
          const spawnSeagull = canSeagull && (!canSpill || Math.random() < 0.52);

          if (spawnSeagull) {
            const occupied = new Set(cur.customers.map((c) => c.slotIndex));
            const openSlots = [0, 1, 2, 3].filter((i) => !occupied.has(i));
            const slotIdx = openSlots.length > 0 ? pickRandom(openSlots) : undefined;
            if (slotIdx !== undefined) {
              soundEngine.playSeagull();
              setHazards([
                {
                  id: nextUid('haz'),
                  type: 'seagull',
                  slotIndex: slotIdx,
                  xPercent: 14 + slotIdx * 24,
                  tapsRemaining: 2,
                },
              ]);
            }
          } else if (canSpill) {
            setHazards([
              {
                id: nextUid('haz'),
                type: 'spill',
                xPercent: 25 + Math.random() * 50,
                tapsRemaining: 1,
              },
            ]);
          }
          nextHazardTimerRef.current = 18 + Math.random() * 14;
        }
      }

      // 6. Customer Patience Drain
      const spillPenalty = cur.hazards.some((h) => h.type === 'spill') ? 1.25 : 1;
      let newWalkouts = 0;
      setCustomers((prev) => {
        const next: Customer[] = [];
        for (const c of prev) {
          if (c.mood === 'served' || c.mood === 'leaving') {
            next.push(c);
            continue;
          }
          const updatedPatience = Math.max(0, c.patience - DT * spillPenalty);
          const ratio = updatedPatience / c.maxPatience;
          if (updatedPatience <= 0) {
            newWalkouts += 1;
            soundEngine.playWalkout();
            pushFeedback('Walked Out!', 'warn', 14 + c.slotIndex * 24, 34, `${c.name} lost patience`);
            continue;
          }
          const mood: Customer['mood'] = ratio < 0.28 ? 'impatient' : ratio > 0.68 ? 'happy' : 'waiting';
          next.push({ ...c, patience: updatedPatience, mood });
        }
        return next;
      });

      if (newWalkouts > 0) {
        const totalWalkouts = cur.angryWalkouts + newWalkouts;
        setAngryWalkouts(totalWalkouts);
        setCombo(0);
        if (mode === 'endless' && totalWalkouts >= 3) {
          triggerFinish({ angryWalkouts: totalWalkouts });
          return;
        }
      }

      // 7. Coffee Brewing Progress
      setCoffeeSlots((prev) =>
        prev.map((slot) => {
          if (slot.state !== 'brewing') return slot;
          const nextProg = slot.progress + DT / stats.coffeeBrewSec;
          if (nextProg >= 1) {
            return { ...slot, state: 'ready', progress: 1 };
          }
          return { ...slot, progress: nextProg };
        })
      );

      // 8. Griddle Cooking & Burn Timer
      setGriddleSlots((prev) =>
        prev.map((slot) => {
          if (slot.state === 'cooking') {
            const nextProg = slot.progress + DT / stats.griddleCookSec;
            if (nextProg >= 1) {
              return { ...slot, state: 'ready', progress: 1, burnProgress: 0 };
            }
            return { ...slot, progress: nextProg };
          }
          if (slot.state === 'ready' && stats.griddleBurnSec < 5000) {
            const nextBurn = slot.burnProgress + DT / stats.griddleBurnSec;
            if (nextBurn >= 1) {
              soundEngine.playBurn();
              return { ...slot, state: 'burnt', burnProgress: 1 };
            }
            return { ...slot, burnProgress: nextBurn };
          }
          return slot;
        })
      );

      // 9. Bakery Oven Progress & Burn Timer
      setOvenSlots((prev) =>
        prev.map((slot) => {
          if (slot.state === 'baking') {
            const nextProg = slot.progress + DT / stats.ovenBakeSec;
            if (nextProg >= 1) {
              soundEngine.playOvenDing();
              return { ...slot, state: 'ready', progress: 1, burnProgress: 0 };
            }
            return { ...slot, progress: nextProg };
          }
          if (slot.state === 'ready' && !stats.pastryWarmer && stats.ovenBurnSec < 5000) {
            const nextBurn = slot.burnProgress + DT / stats.ovenBurnSec;
            if (nextBurn >= 1) {
              soundEngine.playBurn();
              return { ...slot, state: 'burnt', burnProgress: 1 };
            }
            return { ...slot, burnProgress: nextBurn };
          }
          return slot;
        })
      );
    }, 100);

    return () => window.clearInterval(interval);
  }, [config, mode, pushFeedback, spawnCustomer, stats, triggerFinish]);

  // Keyboard shortcuts: Escape pauses, Space toggles guide/pause
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showGuide) setShowGuide(false);
        else setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showGuide]);

  // Find best matching customer for a completed item (optionally targeting a specific customer ID)
  const findMatchingTarget = useCallback(
    (item: MenuItem, preferredCustomerId?: string): { customer: Customer; orderId: string } | null => {
      const candidates = customers
        .filter((c) => c.mood !== 'served' && c.mood !== 'leaving')
        .sort((a, b) => a.patience / a.maxPatience - b.patience / b.maxPatience);

      if (preferredCustomerId) {
        const specific = candidates.find((c) => c.id === preferredCustomerId);
        if (specific) {
          const match = specific.orders.find((o) => !o.fulfilled && itemsMatch(o.item, item));
          if (match) return { customer: specific, orderId: match.id };
        }
        return null;
      }

      for (const c of candidates) {
        const match = c.orders.find((o) => !o.fulfilled && itemsMatch(o.item, item));
        if (match) return { customer: c, orderId: match.id };
      }
      return null;
    },
    [customers]
  );

  const deliverItemToCustomer = useCallback(
    (item: MenuItem, preferredCustomerId?: string): boolean => {
      const target = findMatchingTarget(item, preferredCustomerId);
      if (!target) return false;

      const { customer, orderId } = target;
      const basePrice = getItemBasePrice(item);
      const patienceRatio = customer.patience / customer.maxPatience;
      const rushMult = rocketRushLeft > 0 ? 2 : 1;
      const rawTip = Math.round(
        basePrice * 0.35 * (0.4 + patienceRatio) * customer.tipMultiplier * stats.tipBonusMultiplier * rushMult
      );

      const willCompleteCustomer = customer.orders.every(
        (o) => o.fulfilled || o.id === orderId
      );

      let nextCombo = combo;
      let comboBonus = 0;
      if (willCompleteCustomer) {
        const now = Date.now();
        nextCombo = now - lastServeAtRef.current <= 6500 ? combo + 1 : 1;
        lastServeAtRef.current = now;
        comboBonus = nextCombo >= 2 ? nextCombo * 3 : 0;
        setCombo(nextCombo);
        setMaxCombo((prev) => Math.max(prev, nextCombo));
        setServedCount((prev) => prev + 1);
      }

      const totalEarned = basePrice + rawTip + comboBonus;
      setOrdersDelivered((prev) => prev + 1);
      setCoinsEarned((prev) => prev + totalEarned);
      setTipsEarned((prev) => prev + rawTip + comboBonus);

      soundEngine.playServe(willCompleteCustomer ? nextCombo : 1);
      if (willCompleteCustomer) soundEngine.playCash();

      const popupX = 14 + customer.slotIndex * 24;
      pushFeedback(
        `+$${totalEarned}`,
        comboBonus > 0 ? 'combo' : 'gold',
        popupX,
        30,
        comboBonus > 0 ? `COMBO x${nextCombo}!` : rocketRushLeft > 0 ? '2× Launch Tip!' : undefined
      );

      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id !== customer.id) return c;
          const updatedOrders = c.orders.map((o) =>
            o.id === orderId ? { ...o, fulfilled: true } : o
          );
          if (willCompleteCustomer) {
            return { ...c, orders: updatedOrders, mood: 'served', servedBonus: totalEarned };
          }
          return {
            ...c,
            orders: updatedOrders,
            patience: Math.min(c.maxPatience, c.patience + c.maxPatience * 0.22),
          };
        })
      );

      if (willCompleteCustomer) {
        window.setTimeout(() => {
          setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
        }, 650);
      }

      return true;
    },
    [combo, findMatchingTarget, pushFeedback, rocketRushLeft, stats.tipBonusMultiplier]
  );

  // ---------------- BREAKFAST IN A CUP ACTIONS ----------------

  const handlePlaceEmptyCup = () => {
    const emptyIdx = cupSlots.findIndex((c) => !c.active);
    if (emptyIdx === -1) {
      pushFeedback('Cup Mats Full!', 'warn', 50, 62);
      return;
    }
    soundEngine.playTap();
    setCupSlots((prev) =>
      prev.map((slot, i) =>
        i === emptyIdx
          ? { ...slot, active: true, hasSausage: false, hasEgg: false, hasGravy: false, cheddar: false, biscuit: false }
          : slot
      )
    );
    setSelectedCupId(emptyIdx);
  };

  const handleCookOnGriddle = (food: 'sausage' | 'egg') => {
    const emptyIdx = griddleSlots.findIndex((g) => g.state === 'empty');
    if (emptyIdx === -1) {
      pushFeedback('Griddle Full!', 'warn', 50, 56);
      return;
    }
    soundEngine.playSizzle();
    setGriddleSlots((prev) =>
      prev.map((slot, i) =>
        i === emptyIdx
          ? { ...slot, food, state: 'cooking', progress: 0, burnProgress: 0 }
          : slot
      )
    );
  };

  const handleGriddleSlotClick = (slotId: number) => {
    const slot = griddleSlots[slotId];
    if (!slot || slot.state === 'empty' || slot.state === 'cooking') return;

    if (slot.state === 'burnt') {
      soundEngine.playTrash();
      setGriddleSlots((prev) =>
        prev.map((s) => (s.id === slotId ? { ...s, food: null, state: 'empty', progress: 0, burnProgress: 0 } : s))
      );
      return;
    }

    // Ready sausage or egg! Scoop into selected cup or best cup needing it (or auto-place a cup)
    const field = slot.food === 'sausage' ? 'hasSausage' : 'hasEgg';
    let targetCupIdx = -1;

    if (selectedCupId !== null && cupSlots[selectedCupId]?.active && !cupSlots[selectedCupId][field]) {
      targetCupIdx = selectedCupId;
    } else {
      targetCupIdx = cupSlots.findIndex((c) => c.active && !c[field]);
    }

    let autoSpawned = false;
    if (targetCupIdx === -1) {
      const openCupIdx = cupSlots.findIndex((c) => !c.active);
      if (openCupIdx !== -1) {
        targetCupIdx = openCupIdx;
        autoSpawned = true;
      }
    }

    if (targetCupIdx === -1) {
      pushFeedback('Need an Open Cup!', 'warn', 50, 62);
      return;
    }

    soundEngine.playScoop();
    setCupSlots((prev) =>
      prev.map((c, idx) =>
        idx === targetCupIdx
          ? {
              ...c,
              active: true,
              hasSausage: autoSpawned ? slot.food === 'sausage' : c.hasSausage || slot.food === 'sausage',
              hasEgg: autoSpawned ? slot.food === 'egg' : c.hasEgg || slot.food === 'egg',
              hasGravy: autoSpawned ? false : c.hasGravy,
              cheddar: autoSpawned ? false : c.cheddar,
              biscuit: autoSpawned ? false : c.biscuit,
            }
          : c
      )
    );
    setSelectedCupId(targetCupIdx);
    setGriddleSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, food: null, state: 'empty', progress: 0, burnProgress: 0 } : s))
    );
  };

  const handleAddCupIngredient = (ingredient: 'hasGravy' | 'cheddar' | 'biscuit') => {
    let targetIdx = -1;
    if (selectedCupId !== null && cupSlots[selectedCupId]?.active && !cupSlots[selectedCupId][ingredient]) {
      targetIdx = selectedCupId;
    } else {
      targetIdx = cupSlots.findIndex((c) => c.active && !c[ingredient]);
    }

    // For gravy, allow auto-spawning a cup if none are out
    if (targetIdx === -1 && ingredient === 'hasGravy') {
      const openIdx = cupSlots.findIndex((c) => !c.active);
      if (openIdx !== -1) {
        soundEngine.playGravy();
        setCupSlots((prev) =>
          prev.map((c, idx) =>
            idx === openIdx
              ? { ...c, active: true, hasSausage: false, hasEgg: false, hasGravy: true, cheddar: false, biscuit: false }
              : c
          )
        );
        setSelectedCupId(openIdx);
        return;
      }
    }

    if (targetIdx === -1) {
      pushFeedback('Place a Cup First!', 'warn', 50, 62);
      return;
    }

    if (ingredient === 'hasGravy') soundEngine.playGravy();
    else soundEngine.playScoop();

    setCupSlots((prev) =>
      prev.map((c, idx) => (idx === targetIdx ? { ...c, [ingredient]: true } : c))
    );
    setSelectedCupId(targetIdx);
  };

  const clearCupSlot = (slotId: number) => {
    setCupSlots((prev) =>
      prev.map((c) =>
        c.id === slotId
          ? { ...c, active: false, hasSausage: false, hasEgg: false, hasGravy: false, cheddar: false, biscuit: false }
          : c
      )
    );
    if (selectedCupId === slotId) setSelectedCupId(null);
  };

  const handleCupSlotClick = (slotId: number) => {
    const slot = cupSlots[slotId];
    if (!slot || !slot.active) {
      handlePlaceEmptyCup();
      return;
    }

    if (isCupComplete(slot)) {
      const item: MenuItem = {
        kind: 'breakfast_cup',
        hasSausage: true,
        hasEgg: true,
        hasGravy: true,
        cheddar: slot.cheddar,
        biscuit: slot.biscuit,
      };
      if (deliverItemToCustomer(item)) {
        clearCupSlot(slotId);
        return;
      }
    }

    soundEngine.playTap();
    setSelectedCupId(slotId);
  };

  // ---------------- COFFEE BAR ACTIONS ----------------

  const handleStartCoffee = (iced: boolean) => {
    const emptyIdx = coffeeSlots.findIndex((s) => s.state === 'empty');
    if (emptyIdx === -1) {
      pushFeedback('Coffee Bar Full!', 'warn', 18, 60);
      return;
    }
    soundEngine.playCoffeePour();
    setCoffeeSlots((prev) =>
      prev.map((slot, i) =>
        i === emptyIdx
          ? { ...slot, state: 'brewing', progress: 0, iced, syrup: 'plain', coldFoam: false }
          : slot
      )
    );
    setSelectedCoffeeId(emptyIdx);
  };

  const handleAddSyrup = (syrup: SyrupFlavor) => {
    let targetIdx = -1;
    if (selectedCoffeeId !== null && coffeeSlots[selectedCoffeeId]?.state !== 'empty' && coffeeSlots[selectedCoffeeId].syrup === 'plain') {
      targetIdx = selectedCoffeeId;
    } else {
      targetIdx = coffeeSlots.findIndex((s) => s.state !== 'empty' && s.syrup === 'plain');
    }
    if (targetIdx === -1) {
      pushFeedback('Brew a Coffee First!', 'warn', 18, 60);
      return;
    }
    soundEngine.playScoop();
    setCoffeeSlots((prev) => prev.map((s, i) => (i === targetIdx ? { ...s, syrup } : s)));
    setSelectedCoffeeId(targetIdx);
  };

  const handleAddColdFoam = () => {
    let targetIdx = -1;
    if (selectedCoffeeId !== null && coffeeSlots[selectedCoffeeId]?.state !== 'empty' && !coffeeSlots[selectedCoffeeId].coldFoam) {
      targetIdx = selectedCoffeeId;
    } else {
      targetIdx = coffeeSlots.findIndex((s) => s.state !== 'empty' && !s.coldFoam);
    }
    if (targetIdx === -1) {
      pushFeedback('Brew a Coffee First!', 'warn', 18, 60);
      return;
    }
    soundEngine.playScoop();
    setCoffeeSlots((prev) => prev.map((s, i) => (i === targetIdx ? { ...s, coldFoam: true } : s)));
    setSelectedCoffeeId(targetIdx);
  };

  const clearCoffeeSlot = (slotId: number) => {
    setCoffeeSlots((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? { ...s, state: 'empty', progress: 0, iced: false, syrup: 'plain', coldFoam: false }
          : s
      )
    );
    if (selectedCoffeeId === slotId) setSelectedCoffeeId(null);
  };

  const handleCoffeeSlotClick = (slotId: number) => {
    const slot = coffeeSlots[slotId];
    if (!slot || slot.state === 'empty') return;

    if (slot.state === 'ready') {
      const item: CoffeeItem = {
        kind: 'coffee',
        iced: slot.iced,
        syrup: slot.syrup,
        coldFoam: slot.coldFoam,
      };
      if (deliverItemToCustomer(item)) {
        clearCoffeeSlot(slotId);
        return;
      }
    }

    soundEngine.playTap();
    setSelectedCoffeeId(slotId);
  };

  // ---------------- BAKERY OVEN ACTIONS ----------------

  const handleBakePastry = (pastry: BakeryKind) => {
    const emptyIdx = ovenSlots.findIndex((o) => o.state === 'empty');
    if (emptyIdx === -1) {
      pushFeedback('Oven Full!', 'warn', 82, 60);
      return;
    }
    soundEngine.playTap();
    setOvenSlots((prev) =>
      prev.map((slot, i) =>
        i === emptyIdx ? { ...slot, pastry, state: 'baking', progress: 0, burnProgress: 0 } : slot
      )
    );
  };

  const clearOvenSlot = (slotId: number) => {
    setOvenSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, pastry: null, state: 'empty', progress: 0, burnProgress: 0 } : s))
    );
  };

  const handleOvenSlotClick = (slotId: number) => {
    const slot = ovenSlots[slotId];
    if (!slot || slot.state === 'empty' || slot.state === 'baking') return;

    if (slot.state === 'burnt') {
      soundEngine.playTrash();
      clearOvenSlot(slotId);
      return;
    }

    if (slot.pastry) {
      const item: MenuItem = { kind: 'bakery', pastry: slot.pastry };
      if (deliverItemToCustomer(item)) {
        clearOvenSlot(slotId);
      } else {
        pushFeedback('No Order Yet!', 'warn', 82, 58);
      }
    }
  };

  // ---------------- DRAG & DROP + TRASH + HAZARDS ----------------

  const handleDropOnCustomer = (customerId: string) => {
    if (!dragPayload) return;
    if (dragPayload.source === 'cup') {
      const slot = cupSlots[dragPayload.slotId];
      if (slot && slot.active && isCupComplete(slot)) {
        const item: MenuItem = {
          kind: 'breakfast_cup',
          hasSausage: true,
          hasEgg: true,
          hasGravy: true,
          cheddar: slot.cheddar,
          biscuit: slot.biscuit,
        };
        if (deliverItemToCustomer(item, customerId)) clearCupSlot(slot.id);
      }
    } else if (dragPayload.source === 'coffee') {
      const slot = coffeeSlots[dragPayload.slotId];
      if (slot && slot.state === 'ready') {
        const item: CoffeeItem = { kind: 'coffee', iced: slot.iced, syrup: slot.syrup, coldFoam: slot.coldFoam };
        if (deliverItemToCustomer(item, customerId)) clearCoffeeSlot(slot.id);
      }
    } else if (dragPayload.source === 'oven') {
      const slot = ovenSlots[dragPayload.slotId];
      if (slot && slot.state === 'ready' && slot.pastry) {
        const item: MenuItem = { kind: 'bakery', pastry: slot.pastry };
        if (deliverItemToCustomer(item, customerId)) clearOvenSlot(slot.id);
      }
    }
    setDragPayload(null);
  };

  const handleTrashSelectedOrDragged = () => {
    if (dragPayload) {
      soundEngine.playTrash();
      if (dragPayload.source === 'cup') clearCupSlot(dragPayload.slotId);
      else if (dragPayload.source === 'coffee') clearCoffeeSlot(dragPayload.slotId);
      else if (dragPayload.source === 'oven') clearOvenSlot(dragPayload.slotId);
      setDragPayload(null);
      setTrashHover(false);
      return;
    }

    if (selectedCupId !== null && cupSlots[selectedCupId]?.active) {
      soundEngine.playTrash();
      clearCupSlot(selectedCupId);
      return;
    }
    if (selectedCoffeeId !== null && coffeeSlots[selectedCoffeeId]?.state !== 'empty') {
      soundEngine.playTrash();
      clearCoffeeSlot(selectedCoffeeId);
    }
  };

  const handleHazardClick = (hazard: CounterHazard) => {
    if (hazard.tapsRemaining > 1) {
      soundEngine.playSeagull();
      setHazards((prev) =>
        prev.map((h) => (h.id === hazard.id ? { ...h, tapsRemaining: h.tapsRemaining - 1 } : h))
      );
      return;
    }

    if (hazard.type === 'seagull') {
      soundEngine.playCash();
      setCoinsEarned((c) => c + 5);
      setTipsEarned((t) => t + 5);
      pushFeedback('+$5 Shoo!', 'good', hazard.xPercent, 36, 'Seagull flew off!');
    } else {
      soundEngine.playWipe();
      setCoinsEarned((c) => c + 3);
      setTipsEarned((t) => t + 3);
      pushFeedback('+$3 Sparkle!', 'good', hazard.xPercent, 46, 'Counter clean!');
    }
    setHazards((prev) => prev.filter((h) => h.id !== hazard.id));
  };

  // Helper checks for glowing "SERVE!" highlight
  const isCupMatchingAny = (slot: CupPrepSlot): boolean => {
    if (!slot.active || !isCupComplete(slot)) return false;
    return Boolean(
      findMatchingTarget({
        kind: 'breakfast_cup',
        hasSausage: true,
        hasEgg: true,
        hasGravy: true,
        cheddar: slot.cheddar,
        biscuit: slot.biscuit,
      })
    );
  };

  const isCoffeeMatchingAny = (slot: CoffeeSlot): boolean => {
    if (slot.state !== 'ready') return false;
    return Boolean(
      findMatchingTarget({
        kind: 'coffee',
        iced: slot.iced,
        syrup: slot.syrup,
        coldFoam: slot.coldFoam,
      })
    );
  };

  const isOvenMatchingAny = (slot: OvenSlot): boolean => {
    if (slot.state !== 'ready' || !slot.pastry) return false;
    return Boolean(findMatchingTarget({ kind: 'bakery', pastry: slot.pastry }));
  };

  const formatClock = (sec: number) => {
    const s = Math.ceil(sec);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, '0')}`;
  };

  const unlockedFlavorSyrups = config.syrups.filter((s) => s !== 'plain');

  return (
    <div className={`game-screen ${rocketRushLeft > 0 ? 'rocket-rush-active' : ''}`}>
      {/* TOP HUD */}
      <header className="game-hud">
        <div className="hud-left">
          <button
            id="btn-pause"
            className="hud-icon-btn"
            onClick={() => {
              soundEngine.playTap();
              setPaused((p) => !p);
            }}
            title="Pause Shift"
          >
            {paused ? '▶' : '❚❚'}
          </button>
          <div className="hud-shift-badge">
            <span className="hud-shift-tag">
              {mode === 'endless' ? 'ENDLESS RUSH' : `DAY ${dayNumber}`}
            </span>
            <span className="hud-shift-name">{config.title}</span>
          </div>
        </div>

        <div className="hud-center">
          {mode === 'shift' ? (
            <div className={`hud-pill hud-timer ${timeLeft <= 15 ? 'urgent' : ''}`}>
              <span className="hud-label">SHIFT</span>
              <span className="hud-value">{formatClock(timeLeft)}</span>
            </div>
          ) : (
            <div className="hud-pill hud-hearts" aria-label="Remaining customer lives">
              <span className="hud-label">LIVES</span>
              <span className="hud-value">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={i < 3 - angryWalkouts ? 'heart-on' : 'heart-off'}>
                    ♥
                  </span>
                ))}
              </span>
            </div>
          )}

          <div className="hud-pill hud-served">
            <span className="hud-label">SERVED</span>
            <span className="hud-value">
              {servedCount}
              {mode === 'shift' && <small>/{config.starTargets[2]}</small>}
            </span>
          </div>

          <div className="hud-pill hud-coins">
            <span className="hud-label">TILL</span>
            <span className="hud-value">${coinsEarned}</span>
          </div>

          {combo >= 2 && (
            <div className="hud-combo-badge" key={combo}>
              🔥 {combo}× COMBO!
            </div>
          )}
        </div>

        <div className="hud-right">
          <button
            id="btn-recipe-guide"
            className="hud-icon-btn"
            onClick={() => {
              soundEngine.playTap();
              setShowGuide(true);
            }}
            title="Recipe & Station Guide"
          >
            ?
          </button>
          <button
            id="btn-mute-game"
            className="hud-icon-btn"
            onClick={onToggleMute}
            title={saveData.muted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {saveData.muted ? '🔇' : '🔊'}
          </button>
        </div>
      </header>

      {/* CAFE STAGE (TITUSVILLE WINDOW + 4 CUSTOMER SPOTS) */}
      <section className="cafe-stage" aria-label="Customer counter">
        <TitusvilleWindow rocketActive={rocketRushLeft > 0} rocketProgress={rocketProgress} />

        {/* Rocket Rush Banner */}
        {rocketRushLeft > 0 && (
          <div className="rocket-banner">
            🚀 CAPE CANAVERAL LAUNCH RUSH! <strong>2× TIPS</strong> ({Math.ceil(rocketRushLeft)}s)
          </div>
        )}

        {/* Day 1 Helpful Non-Blocking Ribbon until first customer is served */}
        {mode === 'shift' && dayNumber === 1 && servedCount === 0 && (
          <div className="first-serve-hint">
            <strong>Quick Tip:</strong> Cook Sausage &amp; Egg on the Griddle → Tap them when golden to scoop into a Cup → Ladle Gravy → Tap glowing <em>SERVE!</em> items!
          </div>
        )}

        {/* Customer Slots */}
        <div className="customer-row">
          {[0, 1, 2, 3].map((slotIdx) => {
            const cust = customers.find((c) => c.slotIndex === slotIdx);
            const seagull = hazards.find((h) => h.type === 'seagull' && h.slotIndex === slotIdx);

            return (
              <div
                key={slotIdx}
                className={`customer-slot ${dragPayload ? 'drop-ready' : ''}`}
                onDragOver={(e) => {
                  if (cust) e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (cust) handleDropOnCustomer(cust.id);
                }}
              >
                {seagull && (
                  <button
                    className="hazard-seagull"
                    onClick={() => handleHazardClick(seagull)}
                    title="Tap twice to shoo the cheeky seagull!"
                  >
                    <SeagullArt />
                    <span className="hazard-tag">TAP ×{seagull.tapsRemaining}!</span>
                  </button>
                )}

                {cust && (
                  <div className={`customer-card mood-${cust.mood}`}>
                    {/* Order Speech Bubble */}
                    <div className="order-bubble">
                      <div className="order-items-row">
                        {cust.orders.map((entry) => (
                          <div
                            key={entry.id}
                            className={`order-chip ${entry.fulfilled ? 'fulfilled' : ''}`}
                            title={getItemTitle(entry.item)}
                          >
                            <OrderItemArt item={entry.item} size={40} />
                            <span className="order-chip-label">
                              {entry.item.kind === 'breakfast_cup'
                                ? entry.item.cheddar && entry.item.biscuit
                                  ? 'Cup+Ch+Bsc'
                                  : entry.item.cheddar
                                    ? 'Cup+Cheddar'
                                    : entry.item.biscuit
                                      ? 'Cup+Biscuit'
                                      : 'Brkfst Cup'
                                : entry.item.kind === 'coffee'
                                  ? `${entry.item.iced ? 'Iced ' : ''}${SYRUPS[entry.item.syrup].shortName}${entry.item.coldFoam ? '+Foam' : ''}`
                                  : PASTRIES[entry.item.pastry].shortName}
                            </span>
                            {entry.fulfilled && <span className="order-check">✓</span>}
                          </div>
                        ))}
                      </div>
                      {/* Patience Meter */}
                      <div className="patience-track">
                        <div
                          className={`patience-fill ${
                            cust.patience / cust.maxPatience < 0.28
                              ? 'low'
                              : cust.patience / cust.maxPatience < 0.58
                                ? 'mid'
                                : 'high'
                          }`}
                          style={{ width: `${Math.max(0, (cust.patience / cust.maxPatience) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Customer Character */}
                    <div className="customer-avatar-wrap">
                      <CustomerAvatar archetype={cust.archetype} variant={cust.variant} mood={cust.mood} />
                      <span className="customer-nameplate">
                        {cust.name} • {CUSTOMER_ARCHETYPES[cust.archetype].title.split(' ')[1]}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Counter Spill Hazard */}
        {hazards
          .filter((h) => h.type === 'spill')
          .map((spill) => (
            <button
              key={spill.id}
              className="hazard-spill"
              style={{ left: `${spill.xPercent}%` }}
              onClick={() => handleHazardClick(spill)}
              title="Tap to wipe coffee spill!"
            >
              <CoffeeSpillArt />
              <span className="hazard-tag">WIPE SPILL!</span>
            </button>
          ))}

        {/* Floating Score / Combo Feedbacks */}
        <div className="floating-layer" aria-live="polite">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className={`floating-popup tone-${fb.tone}`}
              style={{ left: `${fb.x}%`, top: `${fb.y}%` }}
            >
              <span className="fp-main">{fb.text}</span>
              {fb.subtext && <span className="fp-sub">{fb.subtext}</span>}
            </div>
          ))}
        </div>
      </section>

      {/* WARM WOODEN SERVICE LEDGE */}
      <div className="counter-ledge">
        <span>☀️ SUNRISE BREAD &amp; COFFEE CO. • 315 S HOPKINS AVE, TITUSVILLE</span>
        <button
          id="btn-trash-can"
          className={`trash-btn ${trashHover ? 'trash-hover' : ''}`}
          onClick={handleTrashSelectedOrDragged}
          onDragOver={(e) => {
            e.preventDefault();
            setTrashHover(true);
          }}
          onDragLeave={() => setTrashHover(false)}
          onDrop={(e) => {
            e.preventDefault();
            handleTrashSelectedOrDragged();
          }}
          title="Discard selected or dragged item"
        >
          🗑 Trash
        </button>
      </div>

      {/* 3-ZONE KITCHEN & BARISTA WORKSPACE */}
      <main className="kitchen-grid">
        {/* LEFT ZONE: COFFEE & ESPRESSO BAR */}
        <section className="station-card station-coffee" aria-label="Coffee Bar">
          <div className="station-header">
            <h2>☕ Coffee Bar</h2>
            <span className="station-sub">Brew → Mix Flavor → Serve</span>
          </div>

          <div className="coffee-brew-actions">
            <button
              id="btn-brew-hot"
              className="action-btn btn-hot-coffee"
              onClick={() => handleStartCoffee(false)}
            >
              <span className="btn-emoji">☕</span>
              <span>Hot Coffee</span>
            </button>
            {config.allowIced && (
              <button
                id="btn-brew-iced"
                className="action-btn btn-iced-coffee"
                onClick={() => handleStartCoffee(true)}
              >
                <span className="btn-emoji">🧊</span>
                <span>Iced Coffee</span>
              </button>
            )}
          </div>

          {/* Coffee Cup Slots */}
          <div className="slot-grid coffee-slots">
            {coffeeSlots.map((slot) => {
              const matching = isCoffeeMatchingAny(slot);
              const isSelected = selectedCoffeeId === slot.id && slot.state !== 'empty';
              return (
                <div
                  key={slot.id}
                  className={`prep-slot coffee-slot state-${slot.state} ${isSelected ? 'selected' : ''} ${matching ? 'match-serve' : ''}`}
                  draggable={slot.state === 'ready'}
                  onDragStart={() => setDragPayload({ source: 'coffee', slotId: slot.id })}
                  onDragEnd={() => setDragPayload(null)}
                  onClick={() => handleCoffeeSlotClick(slot.id)}
                >
                  {slot.state === 'empty' ? (
                    <span className="slot-empty-text">Spout {slot.id + 1}</span>
                  ) : (
                    <>
                      <CoffeeCupArt
                        iced={slot.iced}
                        syrup={slot.syrup}
                        coldFoam={slot.coldFoam}
                        size={52}
                      />
                      <span className="slot-caption">
                        {slot.iced ? 'Iced ' : ''}
                        {SYRUPS[slot.syrup].shortName}
                        {slot.coldFoam ? ' +Foam' : ''}
                      </span>
                      {slot.state === 'brewing' && (
                        <div className="mini-progress">
                          <div className="mini-progress-bar brew" style={{ width: `${slot.progress * 100}%` }} />
                        </div>
                      )}
                      {matching && <span className="serve-pill">SERVE!</span>}
                      <button
                        className="slot-discard-x"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEngine.playTrash();
                          clearCoffeeSlot(slot.id);
                        }}
                        title="Discard coffee"
                      >
                        ×
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Syrup Bottles & Cold Foam */}
          <div className="mixers-row">
            {unlockedFlavorSyrups.map((flavor) => {
              const meta = SYRUPS[flavor];
              return (
                <button
                  key={flavor}
                  className="mixer-btn"
                  style={{ '--mixer-color': meta.bottleColor } as React.CSSProperties}
                  onClick={() => handleAddSyrup(flavor)}
                >
                  <span className="mixer-dot" style={{ background: meta.bottleColor }} />
                  <span>{meta.shortName}</span>
                </button>
              );
            })}
            {config.allowColdFoam && (
              <button
                id="btn-add-cold-foam"
                className="mixer-btn mixer-foam"
                onClick={handleAddColdFoam}
              >
                <span className="mixer-dot foam-dot" />
                <span>Cold Foam</span>
              </button>
            )}
          </div>
        </section>

        {/* CENTER ZONE: BREAKFAST IN A CUP STATION */}
        <section className="station-card station-breakfast" aria-label="Breakfast in a Cup Station">
          <div className="station-header">
            <h2>🥓 Breakfast in a Cup</h2>
            <span className="station-sub">Sausage + Egg + Gravy (+ Toppers)</span>
          </div>

          {/* Griddle Row */}
          <div className="griddle-area">
            <div className="griddle-bins">
              <button
                id="btn-cook-sausage"
                className="action-btn btn-sausage"
                onClick={() => handleCookOnGriddle('sausage')}
              >
                <span className="btn-emoji">🍖</span>
                <span>Sausage</span>
              </button>
              <button
                id="btn-cook-egg"
                className="action-btn btn-egg"
                onClick={() => handleCookOnGriddle('egg')}
              >
                <span className="btn-emoji">🍳</span>
                <span>Egg</span>
              </button>
            </div>

            <div className="griddle-burners">
              {griddleSlots.map((slot) => (
                <button
                  key={slot.id}
                  className={`griddle-slot state-${slot.state} ${slot.burnProgress > 0.6 && slot.state === 'ready' ? 'burn-warning' : ''}`}
                  onClick={() => handleGriddleSlotClick(slot.id)}
                >
                  {slot.state === 'empty' ? (
                    <span className="slot-empty-text">Burner {slot.id + 1}</span>
                  ) : (
                    <>
                      <span className="griddle-food-icon">
                        {slot.state === 'burnt' ? '💨' : slot.food === 'sausage' ? '🍖' : '🍳'}
                      </span>
                      <span className="slot-caption">
                        {slot.state === 'burnt'
                          ? 'Burnt! Tap'
                          : slot.state === 'ready'
                            ? 'Ready! Tap'
                            : slot.food === 'sausage'
                              ? 'Sizzling…'
                              : 'Scrambling…'}
                      </span>
                      {slot.state === 'cooking' && (
                        <div className="mini-progress">
                          <div className="mini-progress-bar cook" style={{ width: `${slot.progress * 100}%` }} />
                        </div>
                      )}
                      {slot.state === 'ready' && stats.griddleBurnSec < 5000 && (
                        <div className="mini-progress">
                          <div
                            className="mini-progress-bar burn"
                            style={{ width: `${slot.burnProgress * 100}%` }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Cup Assembly Mats */}
          <div className="cup-prep-area">
            <div className="cup-ingredients-bar">
              <button id="btn-new-cup" className="action-btn btn-cup-stack" onClick={handlePlaceEmptyCup}>
                <span>🥤 + Cup</span>
              </button>
              <button
                id="btn-add-gravy"
                className="action-btn btn-gravy"
                onClick={() => handleAddCupIngredient('hasGravy')}
              >
                <span>🥣 Gravy</span>
              </button>
              {config.allowCheddar && (
                <button
                  id="btn-add-cheddar"
                  className="action-btn btn-cheddar"
                  onClick={() => handleAddCupIngredient('cheddar')}
                >
                  <span>🧀 Cheddar</span>
                </button>
              )}
              {config.allowBiscuit && (
                <button
                  id="btn-add-biscuit"
                  className="action-btn btn-biscuit"
                  onClick={() => handleAddCupIngredient('biscuit')}
                >
                  <span>🥐 Biscuit</span>
                </button>
              )}
            </div>

            <div className="slot-grid cup-slots">
              {cupSlots.map((slot) => {
                const complete = slot.active && isCupComplete(slot);
                const matching = isCupMatchingAny(slot);
                const isSelected = selectedCupId === slot.id && slot.active;
                return (
                  <div
                    key={slot.id}
                    className={`prep-slot cup-slot ${slot.active ? 'active' : 'empty'} ${isSelected ? 'selected' : ''} ${matching ? 'match-serve' : complete ? 'ready-cup' : ''}`}
                    draggable={complete}
                    onDragStart={() => setDragPayload({ source: 'cup', slotId: slot.id })}
                    onDragEnd={() => setDragPayload(null)}
                    onClick={() => handleCupSlotClick(slot.id)}
                  >
                    {!slot.active ? (
                      <span className="slot-empty-text">Tap + Cup</span>
                    ) : (
                      <>
                        <BreakfastCupArt
                          hasSausage={slot.hasSausage}
                          hasEgg={slot.hasEgg}
                          hasGravy={slot.hasGravy}
                          cheddar={slot.cheddar}
                          biscuit={slot.biscuit}
                          size={54}
                        />
                        <div className="cup-layer-pills">
                          <span className={slot.hasSausage ? 'on' : ''}>S</span>
                          <span className={slot.hasEgg ? 'on' : ''}>E</span>
                          <span className={slot.hasGravy ? 'on' : ''}>G</span>
                          {slot.cheddar && <span className="extra">Ch</span>}
                          {slot.biscuit && <span className="extra">Bs</span>}
                        </div>
                        {matching && <span className="serve-pill">SERVE!</span>}
                        <button
                          className="slot-discard-x"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEngine.playTrash();
                            clearCupSlot(slot.id);
                          }}
                          title="Discard cup"
                        >
                          ×
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* RIGHT ZONE: BAKERY CASE & OVEN */}
        <section className="station-card station-bakery" aria-label="Bakery Case and Oven">
          <div className="station-header">
            <h2>🥖 Bakery Oven</h2>
            <span className="station-sub">
              {stats.pastryWarmer ? 'Heat-Lamp Warmer Active ✨' : 'Bake Fresh → Tap to Serve'}
            </span>
          </div>

          <div className="pastry-bins">
            {config.pastries.map((pastry) => (
              <button
                key={pastry}
                className="pastry-bin-btn"
                onClick={() => handleBakePastry(pastry)}
              >
                <BakeryItemArt pastry={pastry} size={34} />
                <span>{PASTRIES[pastry].shortName}</span>
              </button>
            ))}
          </div>

          <div className="slot-grid oven-slots">
            {ovenSlots.map((slot) => {
              const matching = isOvenMatchingAny(slot);
              return (
                <div
                  key={slot.id}
                  className={`prep-slot oven-slot state-${slot.state} ${matching ? 'match-serve' : ''} ${slot.burnProgress > 0.65 && slot.state === 'ready' ? 'burn-warning' : ''}`}
                  draggable={slot.state === 'ready'}
                  onDragStart={() => setDragPayload({ source: 'oven', slotId: slot.id })}
                  onDragEnd={() => setDragPayload(null)}
                  onClick={() => handleOvenSlotClick(slot.id)}
                >
                  {slot.state === 'empty' || !slot.pastry ? (
                    <span className="slot-empty-text">Rack {slot.id + 1}</span>
                  ) : (
                    <>
                      <BakeryItemArt pastry={slot.pastry} size={48} burnt={slot.state === 'burnt'} />
                      <span className="slot-caption">
                        {slot.state === 'burnt'
                          ? 'Overbaked!'
                          : slot.state === 'baking'
                            ? 'Baking…'
                            : PASTRIES[slot.pastry].shortName}
                      </span>
                      {slot.state === 'baking' && (
                        <div className="mini-progress">
                          <div className="mini-progress-bar bake" style={{ width: `${slot.progress * 100}%` }} />
                        </div>
                      )}
                      {slot.state === 'ready' && !stats.pastryWarmer && stats.ovenBurnSec < 5000 && (
                        <div className="mini-progress">
                          <div className="mini-progress-bar burn" style={{ width: `${slot.burnProgress * 100}%` }} />
                        </div>
                      )}
                      {matching && <span className="serve-pill">SERVE!</span>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* PAUSE MODAL */}
      {paused && !showGuide && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Shift Paused</h2>
            <p className="modal-subtitle">
              {mode === 'endless' ? 'Endless Sunrise Rush' : `Day ${dayNumber}: ${config.title}`}
            </p>
            <div className="modal-stats-row">
              <div>
                <strong>{servedCount}</strong>
                <span>Served</span>
              </div>
              <div>
                <strong>${coinsEarned}</strong>
                <span>Till</span>
              </div>
              <div>
                <strong>{maxCombo}×</strong>
                <span>Best Combo</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="primary-btn" onClick={() => setPaused(false)}>
                Resume Shift
              </button>
              <button className="secondary-btn" onClick={onExit}>
                Quit to Counter Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK RECIPE GUIDE MODAL */}
      {showGuide && (
        <div className="modal-backdrop">
          <div className="modal-card guide-modal">
            <h2>Sunrise Kitchen Cheat Sheet</h2>
            <div className="guide-grid">
              <div className="guide-item">
                <BreakfastCupArt hasSausage hasEgg hasGravy cheddar biscuit size={54} />
                <div>
                  <h3>Breakfast in a Cup</h3>
                  <p>
                    Cook <strong>Sausage</strong> &amp; <strong>Egg</strong> on the griddle. Tap them when golden to scoop into a cup, ladle warm <strong>Gravy</strong>, and add <strong>Cheddar</strong> or <strong>Biscuit</strong> if ordered!
                  </p>
                </div>
              </div>
              <div className="guide-item">
                <CoffeeCupArt iced syrup="babka" coldFoam size={54} />
                <div>
                  <h3>Coffee &amp; Espresso Bar</h3>
                  <p>
                    Tap <strong>Hot</strong> or <strong>Iced Coffee</strong>, then tap a flavor syrup bottle and/or <strong>Cold Foam</strong> to customize it.
                  </p>
                </div>
              </div>
              <div className="guide-item">
                <BakeryItemArt pastry="cinnamon_roll" size={50} />
                <div>
                  <h3>Bakery Oven &amp; Combos</h3>
                  <p>
                    Tap a pastry to bake it warm. Any finished item with a pulsing <strong>SERVE!</strong> badge can be tapped once (or dragged) to serve! Chain serves within 6 seconds for <strong>Combo Bonus Tips</strong>!
                  </p>
                </div>
              </div>
            </div>
            <button className="primary-btn" onClick={() => setShowGuide(false)}>
              Got It — Back to Counter!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
