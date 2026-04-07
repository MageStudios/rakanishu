// src/logic/combatSystem.ts
// Unified Combat Engine — Warband Turn Queue
// Xoshiro256++ PRNG + Weight-Based Accumulator

import { CombatPhase, CombatLogEntry, TurnEntry } from './combatTypes';
import {
  Xoshiro256pp,
  COMBAT_CONFIG,
  calculateDamage as calcDmg,
  type CombatantState,
  getRng,
  applyChillToEnemy,
  type CompanionSnapshot,
} from './combatUtils';
import { handleJab, handleColdArrow } from './skillHandlers';

export type { CompanionSnapshot };
export type CombatActor = TurnEntry['combatant'];
export { COMBAT_CONFIG, getRng, type CombatantState, applyChillToEnemy };

const MAX_ACCUMULATOR = 10.0;
export const MAX_TICK_ITERATIONS = 100;

export function rebuildTurnQueue(
  playerSpeed: number,
  enemySpeed: number,
  shakira?: CompanionSnapshot,
  kyra?: CompanionSnapshot,
): TurnEntry[] {
  const queue: TurnEntry[] = [
    { combatant: 'player', priority: playerSpeed, accumulator: 0 },
    { combatant: 'enemy', priority: enemySpeed, accumulator: 0 },
  ];
  if (shakira) queue.push({ combatant: 'shakira', priority: shakira.speed, accumulator: 0 });
  if (kyra) queue.push({ combatant: 'kyra', priority: kyra.speed, accumulator: 0 });
  queue.sort((a, b) => b.priority - a.priority);
  return queue;
}

export function popNextActor(
  queue: TurnEntry[],
  iteration: number = 0,
): { actor: string; queue: TurnEntry[] } {
  if (iteration >= MAX_TICK_ITERATIONS) {
    const maxIdx = queue.reduce(
      (best, e, i, arr) => (e.priority >= (arr[best]?.priority ?? 0) ? i : best),
      0,
    );
    return { actor: queue[maxIdx]?.combatant ?? 'none', queue: [...queue] };
  }
  if (queue.length === 0) return { actor: 'none', queue: [] };
  const maxPriority = Math.max(1, ...queue.map(e => e.priority));
  const incremented = queue.map(e => ({
    ...e,
    accumulator: Math.min(MAX_ACCUMULATOR, e.accumulator + e.priority / maxPriority),
  }));
  let bestIdx = -1;
  let bestAcc = 0;
  for (let i = 0; i < incremented.length; i++) {
    if (incremented[i].accumulator >= 1.0 && incremented[i].accumulator > bestAcc) {
      bestAcc = incremented[i].accumulator;
      bestIdx = i;
    }
  }
  if (bestIdx >= 0) {
    const updated = [...incremented];
    updated[bestIdx] = { ...updated[bestIdx], accumulator: updated[bestIdx].accumulator - 1.0 };
    return { actor: updated[bestIdx].combatant, queue: updated };
  }
  return { actor: 'none', queue: incremented };
}

const enemyPool = [
  { name: 'Shade', hp: 50, maxHp: 50, speed: 2, strength: 3, agility: 1, intellect: 2, defense: 1, type: 'MAGIC' as const, monsterType: 'UNDEAD' as const, quality: 'NORMAL' as const },
  { name: 'Wraith', hp: 70, maxHp: 70, speed: 4, strength: 2, agility: 3, intellect: 4, defense: 2, type: 'MAGIC' as const, monsterType: 'UNDEAD' as const, quality: 'NORMAL' as const },
  { name: 'Skeleton', hp: 40, maxHp: 40, speed: 3, strength: 5, agility: 1, intellect: 0, defense: 3, type: 'PHYSICAL' as const, monsterType: 'UNDEAD' as const, quality: 'NORMAL' as const },
];

function spawnEnemy() {
  const idx = getRng().nextInt(0, enemyPool.length - 1);
  return { ...enemyPool[idx] };
}

export interface CombatTickResult {
  newPhase: CombatPhase;
  newTurnQueue: TurnEntry[];
  newEnemy: ReturnType<typeof spawnEnemy> | null;
  playerHpDelta: number;
  enemyHpDelta: number;
  newLogs: CombatLogEntry[];
  shouldLevelUp: boolean;
  shouldFullHeal: boolean;
  shouldPartialHeal: boolean;
  chillStacks: number;
  shakiraHpDelta?: number;
  kyraHpDelta?: number;
  expValue: number;
}

export function combatTick(
  currentTick: number,
  currentPhase: CombatPhase,
  currentPlayerHp: number,
  currentPlayerMaxHp: number,
  playerAgility: number,
  playerSpeed: number,
  currentEnemy: {
    name: string; hp: number; maxHp: number; speed: number;
    strength: number; agility: number; intellect: number; defense: number;
    type: 'PHYSICAL' | 'MAGIC' | 'DEMON' | 'UNDEAD' | 'BEAST' | 'BOSS' | 'UBER';
    monsterType?: 'UNDEAD' | 'DEMON' | 'BEAST' | 'HUMAN';
    quality?: 'NORMAL' | 'CHAMPION' | 'UNIQUE' | 'BOSS' | 'UBER';
  } | null,
  currentLogs: CombatLogEntry[],
  currentTurnQueue: TurnEntry[],
  playerXp: number,
  playerLevel: number,
  shakira?: CompanionSnapshot,
  kyra?: CompanionSnapshot,
  chillStacks: number = 0,
): CombatTickResult {
  const result: CombatTickResult = {
    newPhase: currentPhase, newTurnQueue: currentTurnQueue, newEnemy: null,
    playerHpDelta: 0, enemyHpDelta: 0, newLogs: [],
    shouldLevelUp: false, shouldFullHeal: false, shouldPartialHeal: false,
    chillStacks, shakiraHpDelta: 0, kyraHpDelta: 0,
    expValue: 0,
  };

  if (currentPhase === 'IDLE') {
    result.newEnemy = spawnEnemy();
    result.newPhase = 'ENGAGED';
    result.newTurnQueue = rebuildTurnQueue(playerSpeed, result.newEnemy.speed, shakira, kyra);
    result.expValue = result.newEnemy.strength + result.newEnemy.intellect;
    return result;
  }

  if (currentPhase === 'FINISHED') {
    result.newEnemy = spawnEnemy();
    result.newPhase = 'ENGAGED';
    result.newTurnQueue = rebuildTurnQueue(playerSpeed, result.newEnemy.speed, shakira, kyra);
    result.chillStacks = 0;
    result.expValue = result.newEnemy.strength + result.newEnemy.intellect;
    return result;
  }

  if (currentPhase !== 'ENGAGED' && currentPhase !== 'RESOLVING') return result;

  result.newPhase = 'RESOLVING';
  const effectiveEnemy = currentEnemy ?? spawnEnemy();
  const chillResult = applyChillToEnemy(effectiveEnemy.speed, chillStacks);
  const enemyEffectiveSpeed = chillResult.debuffedSpeed;

  let workingQueue = currentTurnQueue.length > 0
    ? [...currentTurnQueue]
    : rebuildTurnQueue(playerSpeed, enemyEffectiveSpeed, shakira, kyra);

  const { actor, queue } = popNextActor(workingQueue);
  workingQueue = queue;

  if (actor === 'none') {
    result.newPhase = 'ENGAGED';
    result.newTurnQueue = workingQueue;
    return result;
  }

  function makeEnemy(): CombatantState {
    const baseType: 'PHYSICAL' | 'MAGIC' = effectiveEnemy.type as 'PHYSICAL' | 'MAGIC';
    return {
      name: effectiveEnemy.name, hp: effectiveEnemy.hp, maxHp: effectiveEnemy.maxHp,
      strength: effectiveEnemy.strength, agility: effectiveEnemy.agility,
      intellect: effectiveEnemy.intellect, defense: effectiveEnemy.defense,
      speed: enemyEffectiveSpeed, type: baseType,
      monsterType: effectiveEnemy.monsterType,
      quality: effectiveEnemy.quality,
    };
  }

  function makePlayer(): CombatantState {
    return {
      name: 'Player', hp: currentPlayerHp, maxHp: currentPlayerMaxHp,
      strength: 5, agility: playerAgility, intellect: 0, defense: 1,
      speed: playerSpeed, type: 'PHYSICAL',
    };
  }

  if (actor === 'player') {
    if (!effectiveEnemy || effectiveEnemy.hp + result.enemyHpDelta <= 0) {
      result.newPhase = 'FINISHED';
      result.newTurnQueue = workingQueue;
      return result;
    }
    const dmg = calcDmg(makePlayer(), makeEnemy());
    result.enemyHpDelta = -dmg.damage;
    result.newLogs.push({
      tick: currentTick, source: 'Player', target: effectiveEnemy.name,
      value: dmg.damage, type: 'PHYSICAL', isCrit: dmg.isCrit,
      message: dmg.isCrit
        ? `Player strikes ${effectiveEnemy.name} for ${dmg.damage} CRIT!`
        : `Player strikes ${effectiveEnemy.name} for ${dmg.damage} DMG`,
    });
    result.newPhase = effectiveEnemy.hp + result.enemyHpDelta <= 0 ? 'FINISHED' : 'ENGAGED';
  }

  else if (actor === 'enemy') {
    if (!effectiveEnemy) {
      result.newPhase = 'FINISHED';
      result.newTurnQueue = workingQueue;
      return result;
    }
    const dmg = calcDmg(makeEnemy(), makePlayer());
    result.playerHpDelta = -dmg.damage;
    const enemyLogType: 'PHYSICAL' | 'MAGIC' = (effectiveEnemy.type === 'MAGIC' || effectiveEnemy.intellect > effectiveEnemy.strength) ? 'MAGIC' : 'PHYSICAL';
    result.newLogs.push({
      tick: currentTick, source: effectiveEnemy.name, target: 'Player',
      value: dmg.damage, type: enemyLogType, isCrit: dmg.isCrit,
      message: dmg.isCrit
        ? `${effectiveEnemy.name} CRITs player for ${dmg.damage}!`
        : `${effectiveEnemy.name} hits player for ${dmg.damage} DMG`,
    });
    result.newPhase = currentPlayerHp + result.playerHpDelta <= 0 ? 'FINISHED' : 'ENGAGED';
  }

  else if (actor === 'shakira' && shakira) {
    if (!effectiveEnemy || effectiveEnemy.hp + result.enemyHpDelta <= 0) {
      result.newPhase = 'FINISHED';
      result.newTurnQueue = workingQueue;
      return result;
    }
    const jabResults = handleJab(shakira, makeEnemy(), effectiveEnemy.hp + result.enemyHpDelta);
    for (const hit of jabResults) {
      if (hit.cancelled) {
        result.newLogs.push({
          tick: currentTick, source: 'Shakira', target: effectiveEnemy.name,
          value: 0, type: 'PHYSICAL', isCrit: false, message: hit.message,
        });
        continue;
      }
      result.enemyHpDelta -= hit.damage;
      result.newLogs.push({
        tick: currentTick, source: 'Shakira', target: effectiveEnemy.name,
        value: hit.damage, type: 'PHYSICAL', isCrit: hit.isCrit, message: hit.message,
      });
    }
    result.newPhase = effectiveEnemy.hp + result.enemyHpDelta <= 0 ? 'FINISHED' : 'ENGAGED';
  }

  else if (actor === 'kyra' && kyra) {
    if (!effectiveEnemy || effectiveEnemy.hp + result.enemyHpDelta <= 0) {
      result.newPhase = 'FINISHED';
      result.newTurnQueue = workingQueue;
      return result;
    }
    const arrowResult = handleColdArrow(kyra, makeEnemy(), chillStacks);
    result.enemyHpDelta -= arrowResult.damage;
    result.chillStacks = arrowResult.chill.stacks;
    result.newLogs.push({
      tick: currentTick, source: 'Kyra', target: effectiveEnemy.name,
      value: arrowResult.damage, type: 'MAGIC', isCrit: arrowResult.isCrit,
      message: arrowResult.message,
    });
    result.newPhase = effectiveEnemy.hp + result.enemyHpDelta <= 0 ? 'FINISHED' : 'ENGAGED';
  }

  if (result.newLogs.length > 50) {
    result.newLogs = result.newLogs.slice(result.newLogs.length - 50);
  }
  return result;
}

export function getCombatConfig() {
  return { ...COMBAT_CONFIG };
}
