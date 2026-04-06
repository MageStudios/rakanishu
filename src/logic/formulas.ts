/* @refresh reload */
/**
 * Math Engine — Core Combat Formulas (refactored)
 * All functions are pure. Scaling sourced from ../data/scalingTable.ts.
 */

import {
  ADDITIVE_SOFT_CAP,
  DAMAGE_VARIANCE_MIN,
  DAMAGE_VARIANCE_MAX,
  RESISTANCE_IMMUNE_THRESHOLD,
  SUNDER_CAP,
  RESISTANCE_FLOOR,
  PIERCE_PCT_PER_LEVEL,
  LEECH_POOL_CAP,
  CHAMPION_XP_MULTIPLIER,
  UNIQUE_XP_MULTIPLIER,
  BOSS_XP_MULTIPLIER,
} from './constants';
import { getRng } from './combatUtils';

// ── Re-export scaling engine (single source of truth) ────────────────────────

export {
  getBaseStats,
  getScaledStat,
  scaleMonsterStats,
  getDifficulty,
  type BaseStats,
  type DifficultyTier,
  DIFFICULTY_MULT,
} from '../data/scalingTable';

// ── 4-Layer Multiplicative Damage ───────────────────────────────────────────

/**
 * Effective damage = base × (1 + additive) × multiplicative × global,
 * with ±15% variance floor'd at 0.
 */
export function calculateEffectiveDamage(
  base: number,
  additive: number,
  multiplicative: number,
  global: number,
): number {
  return Math.max(Math.round(
    base * (1 + Math.min(additive, ADDITIVE_SOFT_CAP)) * multiplicative * global
  ), 0);
}

// ── D2-Style Resistance ─────────────────────────────────────────────────────

export interface ResistResult {
  finalDamage: number;
  wasImmune: boolean;
  effectiveRes: number;
}

export function applyResistance(
  damage: number,
  resistance: number,
  pierce = 0,
  sunder?: { element: string; breakAmount?: number },
): ResistResult {
  let effRes = resistance;

  if (sunder && effRes >= RESISTANCE_IMMUNE_THRESHOLD) {
    effRes = RESISTANCE_IMMUNE_THRESHOLD - 5 - (sunder.breakAmount ?? 40);
  }

  effRes -= pierce;
  effRes = Math.max(effRes, RESISTANCE_FLOOR);

  const wasImmune = resistance >= RESISTANCE_IMMUNE_THRESHOLD && !sunder;

  if (wasImmune) return { finalDamage: 0, wasImmune: true, effectiveRes: resistance };

  const mult = effRes <= 0 ? 1 - effRes / 100 : 1 - effRes / 100;
  const finalDamage = Math.round(damage * mult * 100) / 100;

  return { finalDamage: Math.max(finalDamage, 0), wasImmune: false, effectiveRes: effRes };
}

// ── Pierce ──────────────────────────────────────────────────────────────────

export function calculatePierce(skillLevel: number): boolean {
  const chance = Math.min(skillLevel * PIERCE_PCT_PER_LEVEL, 100);
  const roll = getRng().nextInt(1, 100);
  return roll <= chance;
}

// ── Leech / Steal ───────────────────────────────────────────────────────────

export function calculateLeech(damage: number, percentage: number, maxPool: number): number {
  if (damage <= 0 || percentage <= 0) return 0;
  const raw = damage * percentage;
  const cap = maxPool * LEECH_POOL_CAP;
  return Math.max(0, Math.min(Math.round(raw * 100) / 100, Math.max(cap, 1)));
}

// ── Holy Bolt Auto-Sustain ──────────────────────────────────────────────────

export function calculateHolyBoltHeal(level: number, maxHp: number): number {
  return Math.ceil(level * 15 + maxHp * (level * 0.015));
}

export function getHolyBoltThreshold(level: number): number {
  return Math.min(0.20 + level * 0.03, 0.80);
}

// ── Experience ──────────────────────────────────────────────────────────────

export type MonsterRarity = 'normal' | 'champion' | 'unique' | 'boss';

const XP_LOW_TABLE: Record<number, number> = {
  '-1': 5, '-2': 10, '-3': 20, '-4': 30, '-5': 50, '-6': 200,
  '-7': 100, '-8': 60, '-9': 15, '-10': 5, '-11': 2,
  '6': 80, '7': 70, '8': 55, '9': 38, '10': 18, '11': 10, '12': 5, '13': 2,
};

const HIGH_LEVEL_PENALTY: Record<number, number> = {
  70: 0.9530, 71: 0.9140, 72: 0.8740, 73: 0.8330,
  74: 0.7920, 75: 0.7500, 76: 0.7080, 77: 0.6660,
  78: 0.6250, 79: 0.5840, 80: 0.4840, 81: 0.4420,
  82: 0.4010, 83: 0.3600, 84: 0.3200, 85: 0.2800,
  86: 0.2400, 87: 0.2000, 88: 0.1600, 89: 0.1200,
  90: 0.0590, 91: 0.0450, 92: 0.0300, 93: 0.0200,
  94: 0.0150, 95: 0.0110, 96: 0.0080, 97: 0.0060,
  98: 0.0050, 99: 0.0050,
};

export function calculateExperience(
  monsterLevel: number,
  playerLevel: number,
  baseXp: number,
  rarity: MonsterRarity = 'normal',
): number {
  if (baseXp <= 0) return 0;
  if (monsterLevel <= 0) return 0;

  const diff = monsterLevel - playerLevel;
  let ratio: number;

  if (playerLevel < 25) {
    ratio = (XP_LOW_TABLE[diff] ?? 100) / 100;
  } else if (playerLevel <= 69) {
    if (diff >= 10) ratio = 0.05;
    else if (diff <= 0) ratio = playerLevel / monsterLevel;
    else ratio = (XP_LOW_TABLE[diff] ?? 100) / 100;
  } else {
    const penalty = HIGH_LEVEL_PENALTY[playerLevel] ?? 0.005;
    if (diff >= 10) ratio = 0.05;
    else if (diff <= 0) ratio = Math.min(playerLevel / monsterLevel, 1.0) * penalty;
    else ratio = penalty;
  }

  const rarityMult = rarityXpMultiplier(rarity);
  return Math.floor(baseXp * ratio * rarityMult);
}

export function difficultyXpMultiplier(tier: 'normal' | 'nightmare' | 'hell'): number {
  switch (tier) {
    case 'normal':    return 1.0;
    case 'nightmare': return 3.0;
    case 'hell':      return 5.0;
  }
}

export function rarityXpMultiplier(rarity: MonsterRarity): number {
  switch (rarity) {
    case 'champion': return CHAMPION_XP_MULTIPLIER;
    case 'unique':
    case 'boss':     return UNIQUE_XP_MULTIPLIER;
    default:         return 1.0;
  }
}

