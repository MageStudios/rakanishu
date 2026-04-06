/* @refresh reload */
/**
 * Monster Blueprints — Ratio-Based Scaling
 * 
 * Monsters store percentage ratios applied to the piecewise scaling generator:
 *   finalStat = scalingTable[level].stat × (ratio / 100) × difficultyMult
 *
 * Anchors: Lvl 1/36/67/110 → scalingTable.ts defines the base curve.
 * Each monster only holds ratios (hpRatio, xpRatio, acRatio, dmgRatio).
 */

import type { DifficultyTier } from './scalingTable';

export interface ElementalResistances {
  physical: number;
  fire: number;
  cold: number;
  lightning: number;
  poison: number;
}

/** Ratio-based blueprint — no per-difficulty HP/XP. */
export interface MonsterBlueprint {
  id: string;
  name: string;
  type: 'PHYSICAL' | 'MAGIC' | 'UNDEAD' | 'DEMON' | 'BEAST' | 'BOSS' | 'UBER';
  sunderableType: keyof ElementalResistances | null;
  hpRatio: number;   // percentage of base table HP
  xpRatio: number;   // percentage of base table XP
  acRatio: number;   // percentage of base table AC
  dmgRatio: number;  // percentage of base table DMG
  tierLevel: Record<DifficultyTier, number>;
  /** Static sensory / speed metadata */
  velocity: number;  // movement speed 1–5
  reach: number;     // attack range (grid units)
  vision: number;    // detection radius (tiles)
  resistances: Record<DifficultyTier, ElementalResistances>;
}

/** Scaled output after generator × difficulty spike. */
export interface ScaledStats {
  level: number;
  hp: number;
  xp: number;
  ac: number;
  dmg: number;
  difficultyMult: number;
}

// ── Blueprints ───────────────────────────────────────────────────────────────

/** Fallen — Fire immune in Hell. Baseline: ~3 HP, 18 XP at Lvl 1. */
export const FALLEN: MonsterBlueprint = {
  id: 'fallen',
  name: 'Fallen',
  type: 'DEMON',
  sunderableType: 'fire',
  hpRatio: 46, xpRatio: 59, acRatio: 50, dmgRatio: 100,
  tierLevel: { normal: 1, nightmare: 36, hell: 67, uber: 110 },
  velocity: 3, reach: 1, vision: 6,
  resistances: {
    normal:    { physical: 0, fire: 0,   cold: 0,  lightning: 0,  poison: 0 },
    nightmare: { physical: 5, fire: 30,  cold: 20, lightning: 15, poison: 10 },
    hell:      { physical: 10, fire: 100, cold: 40, lightning: 35, poison: 20 },
    uber:      { physical: 20, fire: 115, cold: 60, lightning: 55, poison: 30 },
  },
};

/** Zombie — Cold immune in Hell, Physical 50%. Baseline: ~9 HP, 33 XP. */
export const ZOMBIE: MonsterBlueprint = {
  id: 'zombie',
  name: 'Zombie',
  type: 'UNDEAD',
  sunderableType: 'cold',
  hpRatio: 144, xpRatio: 95, acRatio: 200, dmgRatio: 150,
  tierLevel: { normal: 1, nightmare: 36, hell: 67, uber: 110 },
  velocity: 1, reach: 1, vision: 4,
  resistances: {
    normal:    { physical: 50, fire: 10, cold: 10,  lightning: 0,  poison: 0 },
    nightmare: { physical: 50, fire: 15, cold: 55,  lightning: 10, poison: 10 },
    hell:      { physical: 50, fire: 25, cold: 120, lightning: 20, poison: 15 },
    uber:      { physical: 60, fire: 40, cold: 140, lightning: 35, poison: 25 },
  },
};

/** Quill Rat — No immunities. Baseline: ~3 HP, 21 XP. */
export const QUILL_RAT: MonsterBlueprint = {
  id: 'quill_rat',
  name: 'Quill Rat',
  type: 'BEAST',
  sunderableType: null,
  hpRatio: 46, xpRatio: 70, acRatio: 125, dmgRatio: 145,
  tierLevel: { normal: 1, nightmare: 36, hell: 67, uber: 110 },
  velocity: 4, reach: 1, vision: 8,
  resistances: {
    normal:    { physical: 50, fire: 10, cold: 0,   lightning: 10, poison: 0 },
    nightmare: { physical: 50, fire: 20, cold: 30,  lightning: 25, poison: 10 },
    hell:      { physical: 50, fire: 45, cold: 50,  lightning: 50, poison: 25 },
    uber:      { physical: 60, fire: 70, cold: 65,  lightning: 75, poison: 40 },
  },
};

export const UNDEAD_WARRIOR: MonsterBlueprint = {
  id: 'undead_warrior', name: 'Undead Warrior', type: 'UNDEAD',
  sunderableType: 'cold',
  hpRatio: 190, xpRatio: 100, acRatio: 150, dmgRatio: 150,
  tierLevel: { normal: 3, nightmare: 26, hell: 70, uber: 110 },
  velocity: 2, reach: 1, vision: 5,
  resistances: {
    normal:    { physical: 10, fire: 10, cold: 10,  lightning: 0,  poison: 0 },
    nightmare: { physical: 20, fire: 15, cold: 55,  lightning: 10, poison: 10 },
    hell:      { physical: 30, fire: 25, cold: 110, lightning: 20, poison: 15 },
    uber:      { physical: 45, fire: 40, cold: 130, lightning: 35, poison: 25 },
  },
};

export const DARK_ARCHER: MonsterBlueprint = {
  id: 'dark_archer', name: 'Dark Archer', type: 'PHYSICAL',
  sunderableType: 'lightning',
  hpRatio: 233, xpRatio: 120, acRatio: 200, dmgRatio: 150,
  tierLevel: { normal: 5, nightmare: 30, hell: 75, uber: 110 },
  velocity: 2, reach: 4, vision: 12,
  resistances: {
    normal:    { physical: 5, fire: 5,   cold: 5,  lightning: 5,  poison: 5 },
    nightmare: { physical: 10, fire: 10, cold: 10, lightning: 10, poison: 10 },
    hell:      { physical: 20, fire: 30, cold: 15, lightning: 55, poison: 15 },
    uber:      { physical: 35, fire: 50, cold: 30, lightning: 115, poison: 30 },
  },
};

export const BLOOD_LORD: MonsterBlueprint = {
  id: 'blood_lord', name: 'Blood Lord', type: 'DEMON',
  sunderableType: 'poison',
  hpRatio: 348, xpRatio: 40, acRatio: 200, dmgRatio: 200,
  tierLevel: { normal: 12, nightmare: 45, hell: 67, uber: 110 },
  velocity: 3, reach: 1, vision: 7,
  resistances: {
    normal:    { physical: 5, fire: 25, cold: 15, lightning: 10, poison: 10 },
    nightmare: { physical: 15, fire: 40, cold: 30, lightning: 20, poison: 55 },
    hell:      { physical: 25, fire: 50, cold: 45, lightning: 30, poison: 130 },
    uber:      { physical: 40, fire: 65, cold: 60, lightning: 50, poison: 150 },
  },
};

export const HELL_WITCH: MonsterBlueprint = {
  id: 'hell_witch', name: 'Hell Witch', type: 'MAGIC',
  sunderableType: 'lightning',
  hpRatio: 215, xpRatio: 450, acRatio: 95, dmgRatio: 200,
  tierLevel: { normal: 10, nightmare: 43, hell: 67, uber: 110 },
  velocity: 2, reach: 3, vision: 10,
  resistances: {
    normal:    { physical: 5, fire: 0,   cold: 0,  lightning: 0,  poison: 0 },
    nightmare: { physical: 10, fire: 10, cold: 15, lightning: 60, poison: 10 },
    hell:      { physical: 20, fire: 30, cold: 35, lightning: 120, poison: 20 },
    uber:      { physical: 35, fire: 50, cold: 55, lightning: 140, poison: 35 },
  },
};

/** All monster blueprints — shadow_hound removed. */
export const MONSTERS: Readonly<MonsterBlueprint[]> = [
  FALLEN, ZOMBIE, QUILL_RAT, UNDEAD_WARRIOR, DARK_ARCHER, BLOOD_LORD, HELL_WITCH,
] as const;

// ── Scaling Engine Bridge ────────────────────────────────────────────────────

import { getBaseStats, getScaledStat } from './scalingTable';

/** Get a monster's stats at a given difficulty (uses scalingTable generator). */
export function scaleMonster(blueprint: MonsterBlueprint, tier: DifficultyTier): ScaledStats {
  const level = blueprint.tierLevel[tier];
  const base = getBaseStats(level);
  const diffMult = tier === 'nightmare' ? 1.25 : tier === 'hell' ? 1.5 : tier === 'uber' ? 7.5 : 1.0;
  return {
    level,
    hp: Math.floor((base.hp * blueprint.hpRatio) / 100 * diffMult),
    xp: Math.floor((base.xp * blueprint.xpRatio) / 100 * diffMult),
    ac: Math.floor((base.ac * blueprint.acRatio) / 100 * diffMult),
    dmg: Math.floor((base.dmg * blueprint.dmgRatio) / 100 * diffMult),
    difficultyMult: diffMult,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getMonsterById(id: string): MonsterBlueprint | undefined {
  return MONSTERS.find(m => m.id === id);
}

export function getHellImmunes(element: keyof ElementalResistances): MonsterBlueprint[] {
  return MONSTERS.filter(m => m.resistances.hell[element] >= 100);
}

export function getSunderableTypes(): (keyof ElementalResistances)[] {
  const types = new Set<keyof ElementalResistances>();
  MONSTERS.forEach(m => { if (m.sunderableType) types.add(m.sunderableType); });
  return [...types];
}

// ── Re-exports ───────────────────────────────────────────────────────────────
export { calculateExperience, difficultyXpMultiplier } from '../logic/formulas';
