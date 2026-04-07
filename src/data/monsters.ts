/* @refresh reload */
/**
 * Monster Blueprints — Ratio-Based Scaling
 * 
 * Monsters store percentage ratios applied to the piecewise scaling generator:
 *   finalStat = scalingTable[level].stat × (ratio / 100) × difficultyMult
 *
 * Anchors: Lvl 1/36/67/110 → scalingTable.ts defines the base curve.
 * Each monster only holds ratios (hpRatio, xpRatio, acRatio, dmgRatio).
 *
 * Act 1 monsters with full stat blocks imported from ./monsters/act1.ts.
 */

import type { DifficultyTier } from './scalingTable';
// Re-export specific Act 1 monster structures if needed
export {
  SPIKE_FIEND,
  SKELETON_ARCHER,
  ACT1_MONSTERS,
  getAct1MonsterById,
  getStatsForDifficulty,
  getHellImmunes as getAct1HellImmunes,
} from './monsters/act1';

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

// ── Blueprints (non-Act1) ───────────────────────────────────────────────────

// ─── Blueprints (Ratio-Based Bestiary) ──────────────────────────────────────

export const FALLEN: MonsterBlueprint = {
  id: 'FALLEN', name: 'Fallen', type: 'DEMON',
  sunderableType: 'fire',
  hpRatio: 36, xpRatio: 120, acRatio: 250, dmgRatio: 100,
  tierLevel: { normal: 1, nightmare: 36, hell: 67, uber: 110 },
  velocity: 3, reach: 1, vision: 6,
  resistances: {
    normal:    { physical: 0, fire: 0,   cold: 0,  lightning: 0,  poison: 0 },
    nightmare: { physical: 5, fire: 30,  cold: 20, lightning: 15, poison: 10 },
    hell:      { physical: 10, fire: 100, cold: 40, lightning: 35, poison: 20 },
    uber:      { physical: 20, fire: 115, cold: 60, lightning: 55, poison: 30 },
  },
};

export const ZOMBIE: MonsterBlueprint = {
  id: 'ZOMBIE', name: 'Zombie', type: 'UNDEAD',
  sunderableType: 'cold',
  hpRatio: 136, xpRatio: 220, acRatio: 250, dmgRatio: 150,
  tierLevel: { normal: 1, nightmare: 36, hell: 67, uber: 110 },
  velocity: 1, reach: 1, vision: 4,
  resistances: {
    normal:    { physical: 10, fire: 0,   cold: 0,  lightning: 0,  poison: 10 },
    nightmare: { physical: 20, fire: 10,  cold: 20, lightning: 10, poison: 10 },
    hell:      { physical: 50, fire: 25,  cold: 105, lightning: 20, poison: 15 },
    uber:      { physical: 65, fire: 40,  cold: 130, lightning: 35, poison: 25 },
  },
};

export const QUILL_RAT: MonsterBlueprint = {
  id: 'QUILL_RAT', name: 'Quill Rat', type: 'BEAST',
  sunderableType: null,
  hpRatio: 43, xpRatio: 140, acRatio: 250, dmgRatio: 100,
  tierLevel: { normal: 1, nightmare: 36, hell: 67, uber: 110 },
  velocity: 4, reach: 4, vision: 8,
  resistances: {
    normal:    { physical: 0, fire: 0,   cold: 0,  lightning: 10, poison: 0 },
    nightmare: { physical: 10, fire: 10, cold: 10, lightning: 25, poison: 10 },
    hell:      { physical: 50, fire: 30,  cold: 30, lightning: 50, poison: 20 },
    uber:      { physical: 65, fire: 45,  cold: 45, lightning: 75, poison: 30 },
  },
};

export const DARK_ARCHER: MonsterBlueprint = {
  id: 'DARK_ARCHER', name: 'Dark Archer', type: 'PHYSICAL',
  sunderableType: 'lightning',
  hpRatio: 162, xpRatio: 231, acRatio: 233, dmgRatio: 150,
  tierLevel: { normal: 7, nightmare: 30, hell: 75, uber: 110 },
  velocity: 2, reach: 4, vision: 12,
  resistances: {
    normal:    { physical: 5, fire: 5,   cold: 5,  lightning: 5,  poison: 5 },
    nightmare: { physical: 10, fire: 10, cold: 10, lightning: 10, poison: 10 },
    hell:      { physical: 20, fire: 30, cold: 15, lightning: 55, poison: 15 },
    uber:      { physical: 35, fire: 50, cold: 30, lightning: 115, poison: 30 },
  },
};

export const TAINTED: MonsterBlueprint = {
  id: 'TAINTED', name: 'Tainted', type: 'DEMON',
  sunderableType: 'lightning',
  hpRatio: 134, xpRatio: 172, acRatio: 170, dmgRatio: 150,
  tierLevel: { normal: 11, nightmare: 40, hell: 70, uber: 110 },
  velocity: 3, reach: 2, vision: 8,
  resistances: {
    normal:    { physical: 0, fire: 0,   cold: 0,  lightning: 25, poison: 0 },
    nightmare: { physical: 10, fire: 10, cold: 10, lightning: 45, poison: 10 },
    hell:      { physical: 20, fire: 20, cold: 20, lightning: 110, poison: 20 },
    uber:      { physical: 35, fire: 35, cold: 35, lightning: 130, poison: 35 },
  },
};

export const SCARAB_DEMON: MonsterBlueprint = {
  id: 'SCARAB_DEMON', name: 'Scarab Demon', type: 'BEAST',
  sunderableType: 'lightning',
  hpRatio: 80, xpRatio: 146, acRatio: 189, dmgRatio: 100,
  tierLevel: { normal: 17, nightmare: 45, hell: 75, uber: 110 },
  velocity: 4, reach: 1, vision: 6,
  resistances: {
    normal:    { physical: 0, fire: 0,   cold: 0,  lightning: 33, poison: 0 },
    nightmare: { physical: 10, fire: 10, cold: 10, lightning: 50, poison: 10 },
    hell:      { physical: 20, fire: 20, cold: 20, lightning: 100, poison: 20 },
    uber:      { physical: 35, fire: 35, cold: 35, lightning: 120, poison: 35 },
  },
};

export const SAND_MAGGOT: MonsterBlueprint = {
  id: 'SAND_MAGGOT', name: 'Sand Maggot', type: 'BEAST',
  sunderableType: 'cold',
  hpRatio: 145, xpRatio: 143, acRatio: 200, dmgRatio: 110,
  tierLevel: { normal: 18, nightmare: 43, hell: 72, uber: 110 },
  velocity: 2, reach: 2, vision: 8,
  resistances: {
    normal:    { physical: 0, fire: 0,   cold: 25, lightning: 0,  poison: 0 },
    nightmare: { physical: 15, fire: 15, cold: 45, lightning: 15, poison: 15 },
    hell:      { physical: 33, fire: 33, cold: 75, lightning: 33, poison: 33 },
    uber:      { physical: 50, fire: 50, cold: 105, lightning: 50, poison: 50 },
  },
};

export const GREATER_MUMMY: MonsterBlueprint = {
  id: 'GREATER_MUMMY', name: 'Greater Mummy', type: 'UNDEAD',
  sunderableType: 'poison',
  hpRatio: 144, xpRatio: 114, acRatio: 170, dmgRatio: 130,
  tierLevel: { normal: 20, nightmare: 48, hell: 78, uber: 110 },
  velocity: 2, reach: 1, vision: 10,
  resistances: {
    normal:    { physical: 10, fire: 25,  cold: 0,  lightning: 0,  poison: 100 },
    nightmare: { physical: 25, fire: 45,  cold: 15, lightning: 15, poison: 110 },
    hell:      { physical: 50, fire: 65,  cold: 33, lightning: 33, poison: 125 },
    uber:      { physical: 75, fire: 85,  cold: 50, lightning: 50, poison: 150 },
  },
};

export const DRIED_CORPSE: MonsterBlueprint = {
  id: 'DRIED_CORPSE', name: 'Dried Corpse', type: 'UNDEAD',
  sunderableType: 'physical',
  hpRatio: 153, xpRatio: 163, acRatio: 232, dmgRatio: 100,
  tierLevel: { normal: 13, nightmare: 41, hell: 71, uber: 110 },
  velocity: 1, reach: 1, vision: 6,
  resistances: {
    normal:    { physical: 20, fire: -20, cold: 0,  lightning: 0,  poison: 0 },
    nightmare: { physical: 33, fire: -10, cold: 10, lightning: 10, poison: 10 },
    hell:      { physical: 50, fire: 0,   cold: 25, lightning: 25, poison: 25 },
    uber:      { physical: 75, fire: 15,  cold: 40, lightning: 40, poison: 40 },
  },
};

export const CLAW_VIPER: MonsterBlueprint = {
  id: 'CLAW_VIPER', name: 'Claw Viper', type: 'BEAST',
  sunderableType: 'cold',
  hpRatio: 121, xpRatio: 165, acRatio: 229, dmgRatio: 120,
  tierLevel: { normal: 11, nightmare: 42, hell: 73, uber: 110 },
  velocity: 4, reach: 1, vision: 8,
  resistances: {
    normal:    { physical: 0, fire: 0,   cold: 25, lightning: 0,  poison: 0 },
    nightmare: { physical: 10, fire: 10, cold: 45, lightning: 10, poison: 10 },
    hell:      { physical: 20, fire: 20, cold: 100, lightning: 20, poison: 20 },
    uber:      { physical: 35, fire: 35, cold: 115, lightning: 35, poison: 35 },
  },
};

export const SABRE_CAT: MonsterBlueprint = {
  id: 'SABRE_CAT', name: 'Sabre Cat', type: 'BEAST',
  sunderableType: null,
  hpRatio: 89, xpRatio: 110, acRatio: 160, dmgRatio: 110,
  tierLevel: { normal: 15, nightmare: 44, hell: 74, uber: 110 },
  velocity: 3, reach: 1, vision: 6,
  resistances: {
    normal:    { physical: 0, fire: 0,   cold: 0,  lightning: 0,  poison: 0 },
    nightmare: { physical: 10, fire: 10, cold: 10, lightning: 10, poison: 10 },
    hell:      { physical: 20, fire: 20, cold: 20, lightning: 20, poison: 20 },
    uber:      { physical: 35, fire: 35, cold: 35, lightning: 35, poison: 35 },
  },
};

export const FETISH: MonsterBlueprint = {
  id: 'FETISH', name: 'Fetish', type: 'DEMON',
  sunderableType: 'fire',
  hpRatio: 34, xpRatio: 37, acRatio: 108, dmgRatio: 90,
  tierLevel: { normal: 10, nightmare: 46, hell: 76, uber: 110 },
  velocity: 5, reach: 1, vision: 10,
  resistances: {
    normal:    { physical: 0, fire: 0,   cold: 0,  lightning: 0,  poison: 0 },
    nightmare: { physical: 10, fire: 50, cold: 10, lightning: 10, poison: 10 },
    hell:      { physical: 20, fire: 100, cold: 33, lightning: 33, poison: 33 },
    uber:      { physical: 35, fire: 120, cold: 50, lightning: 50, poison: 50 },
  },
};

export const ZAKARUMITE: MonsterBlueprint = {
  id: 'ZAKARUMITE', name: 'Zakarumite', type: 'PHYSICAL',
  sunderableType: null,
  hpRatio: 110, xpRatio: 102, acRatio: 212, dmgRatio: 110,
  tierLevel: { normal: 22, nightmare: 50, hell: 80, uber: 110 },
  velocity: 2, reach: 1, vision: 8,
  resistances: {
    normal:    { physical: 0, fire: 0,   cold: 0,  lightning: 0,  poison: 0 },
    nightmare: { physical: 10, fire: 10, cold: 10, lightning: 10, poison: 10 },
    hell:      { physical: 20, fire: 20, cold: 20, lightning: 20, poison: 20 },
    uber:      { physical: 35, fire: 35, cold: 35, lightning: 35, poison: 35 },
  },
};

export const COUNCIL_MEMBER: MonsterBlueprint = {
  id: 'COUNCIL_MEMBER', name: 'Council Member', type: 'DEMON',
  sunderableType: null,
  hpRatio: 255, xpRatio: 207, acRatio: 249, dmgRatio: 200,
  tierLevel: { normal: 25, nightmare: 58, hell: 85, uber: 110 },
  velocity: 3, reach: 1, vision: 12,
  resistances: {
    normal:    { physical: 0, fire: 25,  cold: 25, lightning: 25, poison: 25 },
    nightmare: { physical: 25, fire: 45, cold: 45, lightning: 45, poison: 45 },
    hell:      { physical: 50, fire: 75, cold: 75, lightning: 75, poison: 75 },
    uber:      { physical: 75, fire: 95, cold: 95, lightning: 95, poison: 95 },
  },
};

export const THORN_HULK: MonsterBlueprint = {
  id: 'THORN_HULK', name: 'Thorn Hulk', type: 'BEAST',
  sunderableType: 'cold',
  hpRatio: 157, xpRatio: 138, acRatio: 222, dmgRatio: 150,
  tierLevel: { normal: 22, nightmare: 52, hell: 82, uber: 110 },
  velocity: 2, reach: 2, vision: 8,
  resistances: {
    normal:    { physical: 0, fire: 0,   cold: 50, lightning: 0,  poison: 0 },
    nightmare: { physical: 15, fire: 15, cold: 75, lightning: 15, poison: 15 },
    hell:      { physical: 33, fire: 33, cold: 100, lightning: 33, poison: 33 },
    uber:      { physical: 50, fire: 50, cold: 120, lightning: 50, poison: 50 },
  },
};

export const FINGER_MAGE: MonsterBlueprint = {
  id: 'FINGER_MAGE', name: 'Finger Mage', type: 'UNDEAD',
  sunderableType: 'poison',
  hpRatio: 134, xpRatio: 123, acRatio: 230, dmgRatio: 100,
  tierLevel: { normal: 24, nightmare: 55, hell: 85, uber: 110 },
  velocity: 4, reach: 4, vision: 14,
  resistances: {
    normal:    { physical: 0, fire: 0,   cold: 0,  lightning: 0,  poison: 100 },
    nightmare: { physical: 25, fire: 25, cold: 25, lightning: 25, poison: 110 },
    hell:      { physical: 50, fire: 50, cold: 50, lightning: 50, poison: 125 },
    uber:      { physical: 75, fire: 75, cold: 75, lightning: 75, poison: 150 },
  },
};

export const MEGADEMON: MonsterBlueprint = {
  id: 'MEGADEMON', name: 'Megademon', type: 'DEMON',
  sunderableType: 'fire',
  hpRatio: 102, xpRatio: 106, acRatio: 274, dmgRatio: 150,
  tierLevel: { normal: 30, nightmare: 60, hell: 88, uber: 110 },
  velocity: 3, reach: 2, vision: 10,
  resistances: {
    normal:    { physical: 0, fire: 75,  cold: 0,  lightning: 0,  poison: 0 },
    nightmare: { physical: 15, fire: 95, cold: 15, lightning: 15, poison: 15 },
    hell:      { physical: 33, fire: 100, cold: 33, lightning: 33, poison: 33 },
    uber:      { physical: 50, fire: 120, cold: 50, lightning: 50, poison: 50 },
  },
};

export const OBLIVION_KNIGHT: MonsterBlueprint = {
  id: 'OBLIVION_KNIGHT', name: 'Oblivion Knight', type: 'UNDEAD',
  sunderableType: 'poison',
  hpRatio: 73, xpRatio: 92, acRatio: 290, dmgRatio: 130,
  tierLevel: { normal: 30, nightmare: 62, hell: 89, uber: 110 },
  velocity: 2, reach: 4, vision: 12,
  resistances: {
    normal:    { physical: 0, fire: 0,   cold: 25, lightning: 25, poison: 100 },
    nightmare: { physical: 25, fire: 25, cold: 45, lightning: 45, poison: 110 },
    hell:      { physical: 50, fire: 50, cold: 75, lightning: 75, poison: 125 },
    uber:      { physical: 75, fire: 75, cold: 95, lightning: 95, poison: 150 },
  },
};

export const ENSLAVED: MonsterBlueprint = {
  id: 'ENSLAVED', name: 'Enslaved', type: 'DEMON',
  sunderableType: 'fire',
  hpRatio: 84, xpRatio: 95, acRatio: 271, dmgRatio: 120,
  tierLevel: { normal: 35, nightmare: 65, hell: 80, uber: 110 },
  velocity: 3, reach: 1, vision: 8,
  resistances: {
    normal:    { physical: 0, fire: 25,  cold: 0,  lightning: 0,  poison: 0 },
    nightmare: { physical: 10, fire: 45, cold: 10, lightning: 10, poison: 10 },
    hell:      { physical: 20, fire: 75, cold: 25, lightning: 25, poison: 25 },
    uber:      { physical: 35, fire: 95, cold: 40, lightning: 40, poison: 40 },
  },
};

export const DEATH_MAULER: MonsterBlueprint = {
  id: 'DEATH_MAULER', name: 'Death Mauler', type: 'BEAST',
  sunderableType: null,
  hpRatio: 39, xpRatio: 74, acRatio: 341, dmgRatio: 150,
  tierLevel: { normal: 38, nightmare: 68, hell: 82, uber: 110 },
  velocity: 2, reach: 6, vision: 12,
  resistances: {
    normal:    { physical: 0, fire: 0,   cold: 0,  lightning: 0,  poison: 0 },
    nightmare: { physical: 15, fire: 15, cold: 15, lightning: 15, poison: 15 },
    hell:      { physical: 33, fire: 33, cold: 33, lightning: 33, poison: 33 },
    uber:      { physical: 50, fire: 50, cold: 50, lightning: 50, poison: 50 },
  },
};

export const OVERSEER: MonsterBlueprint = {
  id: 'OVERSEER', name: 'Overseer', type: 'DEMON',
  sunderableType: 'fire',
  hpRatio: 121, xpRatio: 55, acRatio: 226, dmgRatio: 130,
  tierLevel: { normal: 36, nightmare: 66, hell: 81, uber: 110 },
  velocity: 2, reach: 2, vision: 10,
  resistances: {
    normal:    { physical: 0, fire: 25,  cold: 0,  lightning: 0,  poison: 0 },
    nightmare: { physical: 10, fire: 45, cold: 10, lightning: 10, poison: 10 },
    hell:      { physical: 20, fire: 100, cold: 20, lightning: 20, poison: 20 },
    uber:      { physical: 35, fire: 120, cold: 35, lightning: 35, poison: 35 },
  },
};

export const MINION_OF_DESTRUCTION: MonsterBlueprint = {
  id: 'MINION_OF_DESTRUCTION', name: 'Minion of Destruction', type: 'DEMON',
  sunderableType: null,
  hpRatio: 113, xpRatio: 167, acRatio: 233, dmgRatio: 250,
  tierLevel: { normal: 60, nightmare: 85, hell: 110, uber: 130 },
  velocity: 4, reach: 2, vision: 12,
  resistances: {
    normal:    { physical: 0, fire: 0,   cold: 0,  lightning: 0,  poison: 0 },
    nightmare: { physical: 25, fire: 25, cold: 25, lightning: 25, poison: 25 },
    hell:      { physical: 50, fire: 50, cold: 50, lightning: 50, poison: 50 },
    uber:      { physical: 75, fire: 75, cold: 75, lightning: 75, poison: 75 },
  },
};

export const BLOOD_LORD: MonsterBlueprint = {
  id: 'BLOOD_LORD', name: 'Blood Lord', type: 'DEMON',
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
  id: 'HELL_WITCH', name: 'Hell Witch', type: 'MAGIC',
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

/** All monster blueprints (ratio-based). */
export const MONSTERS: Readonly<MonsterBlueprint[]> = [
  FALLEN, ZOMBIE, QUILL_RAT, DARK_ARCHER, TAINTED,
  SCARAB_DEMON, SAND_MAGGOT, GREATER_MUMMY, DRIED_CORPSE, CLAW_VIPER, SABRE_CAT,
  FETISH, ZAKARUMITE, COUNCIL_MEMBER, THORN_HULK,
  FINGER_MAGE, MEGADEMON, OBLIVION_KNIGHT,
  ENSLAVED, DEATH_MAULER, OVERSEER, MINION_OF_DESTRUCTION,
  BLOOD_LORD, HELL_WITCH,
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

// ── Helpers (ratio-based registry) ──────────────────────────────────────────

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

// ── Zone-to-Monster ID Map ──────────────────────────────────────────────────
// Translates display names from zones.ts → blueprint IDs.
export const ZONE_MONSTER_MAP: ReadonlyMap<string, string> = new Map([
  // Act 1
  ['Fallen', 'FALLEN'], ['Fallen One', 'FALLEN'], ['Carver', 'FALLEN'], ['Dark One', 'FALLEN'],
  ['Zombie', 'ZOMBIE'], ['Ghoul', 'ZOMBIE'], ['Drowned Carcass', 'ZOMBIE'], ['Horror', 'ZOMBIE'],
  ['Quill Rat', 'QUILL_RAT'], ['Spike Fiend', 'QUILL_RAT'], ['Thorned Hulk', 'THORN_HULK'],
  ['Dark Hunter', 'DARK_ARCHER'], ['Dark Stalker', 'DARK_ARCHER'], ['Dark Ranger', 'DARK_ARCHER'],
  ['Tainted', 'TAINTED'], ['Misshapen', 'TAINTED'], ['Disfigured', 'TAINTED'],
  ['Dark Archer', 'DARK_ARCHER'], ['Skeleton Archer', 'DARK_ARCHER'],

  // Act 2
  ['Dung Soldier', 'SCARAB_DEMON'], ['Death Beetle', 'SCARAB_DEMON'], ['Scarab', 'SCARAB_DEMON'],
  ['Steel Scarab', 'SCARAB_DEMON'], ['Bone Scarab', 'SCARAB_DEMON'],
  ['Sand Maggot', 'SAND_MAGGOT'], ['Rock Worm', 'SAND_MAGGOT'], ['Devourer', 'SAND_MAGGOT'],
  ['Giant Lamprey', 'SAND_MAGGOT'], ['Blood Maggot', 'SAND_MAGGOT'],
  ['Hollow One', 'GREATER_MUMMY'], ['Guardian', 'GREATER_MUMMY'], ['Unraveler', 'GREATER_MUMMY'],
  ['Horadrim Ancient', 'GREATER_MUMMY'],
  ['Dried Corpse', 'DRIED_CORPSE'], ['Decayed', 'DRIED_CORPSE'], ['Embalmed', 'DRIED_CORPSE'],
  ['Preserved Dead', 'DRIED_CORPSE'], ['Cadaver', 'DRIED_CORPSE'],
  ['Tomb Viper', 'CLAW_VIPER'], ['Claw Viper', 'CLAW_VIPER'], ['Salamander', 'CLAW_VIPER'],
  ['Pit Viper', 'CLAW_VIPER'], ['Serpent Magus', 'CLAW_VIPER'],
  ['Huntress', 'SABRE_CAT'], ['Saber Cat', 'SABRE_CAT'], ['Night Tiger', 'SABRE_CAT'],
  ['Hell Cat', 'SABRE_CAT'],

  // Act 3
  ['Rat Man', 'FETISH'], ['Fetish', 'FETISH'], ['Flayer', 'FETISH'], ['Soul Killer', 'FETISH'],
  ['Stygian Doll', 'FETISH'], ['Fetish Shaman', 'FETISH'], ['Flayer Shaman', 'FETISH'],
  ['Soul Killer Shaman', 'FETISH'],
  ['Zakarumite', 'ZAKARUMITE'], ['Faithful', 'ZAKARUMITE'], ['Zealot', 'ZAKARUMITE'],
  ['Council Member', 'COUNCIL_MEMBER'],
  ['Thorned Hulk', 'THORN_HULK'], ['Bramble Hulk', 'THORN_HULK'], ['Thrasher', 'THORN_HULK'],

  // Act 4
  ['Doom Caster', 'FINGER_MAGE'], ['Strangler', 'FINGER_MAGE'], ['Storm Caster', 'FINGER_MAGE'],
  ['Balrog', 'MEGADEMON'], ['Pit Lord', 'MEGADEMON'], ['Venom Lord', 'MEGADEMON'],
  ['Doom Knight', 'OBLIVION_KNIGHT'], ['Abyss Knight', 'OBLIVION_KNIGHT'], ['Oblivion Knight', 'OBLIVION_KNIGHT'],

  // Act 5
  ['Enslaved', 'ENSLAVED'], ['Slayer', 'ENSLAVED'], ['Ice Boar', 'ENSLAVED'], ['Fire Boar', 'ENSLAVED'],
  ['Hell Spawn', 'ENSLAVED'], ['Ice Spawn', 'ENSLAVED'], ['Greater Hell Spawn', 'ENSLAVED'],
  ['Greater Ice Spawn', 'ENSLAVED'],
  ['Death Mauler', 'DEATH_MAULER'], ['Death Brawler', 'DEATH_MAULER'], ['Death Slasher', 'DEATH_MAULER'],
  ['Death Berserker', 'DEATH_MAULER'], ['Death Brigadier', 'DEATH_MAULER'],
  ['Overseer', 'OVERSEER'], ['Lasher', 'OVERSEER'], ['Overlord', 'OVERSEER'],
  ['Blood Boss', 'OVERSEER'], ['Hell Whip', 'OVERSEER'],
  ['Minion (V1)', 'MINION_OF_DESTRUCTION'], ['Minion (V2)', 'MINION_OF_DESTRUCTION'],
  ['Minion (V3)', 'MINION_OF_DESTRUCTION'],

  // Re-mapped Legacy IDs
  ['Blood Lord', 'BLOOD_LORD'], ['Hell Witch', 'HELL_WITCH'],
]);

// ── Re-exports ───────────────────────────────────────────────────────────────
export { calculateExperience, difficultyXpMultiplier } from '../logic/formulas';
