// src/logic/combatUtils.ts
// Low-level combat math: PRNG, config, damage calculation, accuracy, resistances.

import type { DifficultyTier } from '../data/scalingTable';

// ============================================================
// Xoshiro256++ PRNG — deterministic seed, zero dependencies
// ============================================================

export class Xoshiro256pp {
  private s: Uint32Array;

  constructor(seed: number) {
    this.s = new Uint32Array(4);
    let s0 = seed || 1;
    let s1 = (s0 ^ 0x12345678) * 0x5BD1E995 + seed;
    this.s[0] = s0 >>> 0;
    this.s[1] = s1 >>> 0;
    this.s[2] = ((s0 + s1) * 0x5BD1E995) >>> 0;
    this.s[3] = ((s0 + s1) * 0x5BD1E995) >>> 0;
  }

  next(): number {
    const s = this.s;
    const sl = (a: number, b: number) => (a << b) >>> 0;
    const xo = (a: number, b: number) => (a ^ b) >>> 0;
    const result = sl(xo(s[0], s[3]), 7) + s[0];
    const t = sl(s[1], 9) & 0xFFFFFFFF;
    s[2] = xo(s[2], s[0]);
    s[3] = xo(s[3], s[1]);
    s[1] = xo(s[1], s[2]);
    s[0] = xo(s[0], s[3]);
    s[2] = xo(s[2], t);
    s[3] = sl(s[3], 11);
    return result >>> 0;
  }

  nextFloat(max: number): number {
    return (this.next() & 0x1FFFFFFF) / (0x10000000 / max);
  }

  nextInt(min: number, max: number): number {
    return min + (this.next() % (max - min + 1));
  }
}

const rng = new Xoshiro256pp(1337);

// ============================================================
// Combat Config
// ============================================================

export interface CombatConfig {
  baseDamageMin: number;
  baseDamageMax: number;
  critThreshold: { physical: number; magic: number };
  critMultiplier: number;
}

export const COMBAT_CONFIG: CombatConfig = {
  baseDamageMin: 2,
  baseDamageMax: 8,
  critThreshold: { physical: 0.15, magic: 0.25 },
  critMultiplier: 2.5,
};

// ============================================================
// Combatant State
// ============================================================

export interface CombatantState {
  name: string;
  hp: number;
  maxHp: number;
  strength: number;
  agility: number;
  intellect: number;
  defense: number;
  speed: number;
  type: 'PHYSICAL' | 'MAGIC';
  attackRating?: number;
  damageMin?: number;
  damageMax?: number;
  level?: number;
  monsterType?: 'UNDEAD' | 'DEMON' | 'BEAST' | 'HUMAN';
  quality?: 'NORMAL' | 'CHAMPION' | 'UNIQUE' | 'BOSS' | 'UBER';
}

export interface CompanionSnapshot {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  speed: number;
  strength: number;
  agility: number;
  intellect: number;
  defense: number;
  type: 'PHYSICAL' | 'MAGIC';
  skills: string[];
}

// ============================================================
// D2-Style Accuracy Check
// ============================================================

export function calculateHitChance(
  attackRating: number,
  defenderDefense: number,
  attackerLevel: number,
  defenderLevel: number,
): number {
  if (attackRating <= 0 || defenderDefense < 0) return 0.05;
  const lvl = Math.max(1, attackerLevel);
  const defLvl = Math.max(1, defenderLevel);
  const raw = (attackRating / (attackRating + defenderDefense)) * 2 * (lvl / (lvl + defLvl));
  return Math.max(0.05, Math.min(0.95, raw));
}

// ============================================================
// Resistance / Immunity Mapping
// ============================================================

export interface ElementalResistances {
  physical: number;
  fire: number;
  cold: number;
  lightning: number;
  poison: number;
}

export function applyResistance(rawDamage: number, resistancePercent: number): number {
  if (resistancePercent >= 100) return 0;
  const factor = Math.max(0, 1 - resistancePercent / 100);
  return Math.floor(rawDamage * factor);
}

export function damageTypeToResistanceKey(
  dmgType: 'PHYSICAL' | 'MAGIC',
): keyof ElementalResistances {
  return dmgType === 'PHYSICAL' ? 'physical' : 'lightning';
}

// ============================================================
// Damage Calculation (gear-aware)
// ============================================================

export function calculateDamage(
  attacker: CombatantState,
  defender: CombatantState,
  defenderResistances?: ElementalResistances,
  damageTypeOverride?: 'PHYSICAL' | 'MAGIC',
): { damage: number; isCrit: boolean; type: 'PHYSICAL' | 'MAGIC' } {
  const rng = getRng();
  const dMin = attacker.damageMin ?? COMBAT_CONFIG.baseDamageMin;
  const dMax = attacker.damageMax ?? COMBAT_CONFIG.baseDamageMax;
  const baseRange = dMax - dMin;
  const variance = Math.floor((rng.nextInt(-2, 2) * baseRange) / 10);
  let rawDamage = dMin + Math.floor(baseRange / 2) + variance;
  rawDamage = Math.max(dMin, rawDamage);

  const type = damageTypeOverride ?? attacker.type;
  const critChance = type === 'PHYSICAL'
    ? COMBAT_CONFIG.critThreshold.physical
    : COMBAT_CONFIG.critThreshold.magic;
  const critRoll = rng.nextFloat(1.0);

  let finalDamage = rawDamage;
  let isCrit = false;

  if (critRoll < critChance) {
    finalDamage = Math.floor(rawDamage * COMBAT_CONFIG.critMultiplier);
    isCrit = true;
  }

  const mitigation = defender.defense * 0.1;
  finalDamage = Math.max(1, Math.floor(finalDamage - mitigation));

  if (defenderResistances) {
    const resKey = damageTypeToResistanceKey(type);
    finalDamage = applyResistance(finalDamage, defenderResistances[resKey]);
    finalDamage = Math.max(0, finalDamage);
  }

  return { damage: finalDamage, isCrit, type };
}

// ============================================================
// CHILL Status Effect
// ============================================================

export interface ChillEffect {
  stacks: number;
  debuffedSpeed: number;
}

export function applyChillToEnemy(baseSpeed: number, currentStacks: number): ChillEffect {
  const clamped = Math.min(currentStacks, 5);
  const multiplier = 1 - 0.15 * clamped;
  const debuffedSpeed = Math.max(1, Math.floor(baseSpeed * multiplier));
  return { stacks: clamped, debuffedSpeed };
}

// ============================================================
// Exports
// ============================================================

export function getRng(): Xoshiro256pp {
  return rng;
}