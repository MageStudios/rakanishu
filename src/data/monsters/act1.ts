/* @refresh reload */
/**
 * Act 1 Monster Stat Blocks — Array-Based Format
 *
 * Uses [Normal, Nightmare, Hell] arrays for all difficulty-dependent values.
 * Resistances can exceed 100 (e.g., 105 = immunity + 5% overcap).
 * Full stat blocks: HP, Defense, AR, XP per difficulty tier.
 */

// ─── Types ────────────────────────────────────────────────────────────────

/** Difficulty-indexed array: [Normal, Nightmare, Hell] */
export type DifficultyArray<T> = [T, T, T];

export interface Act1MonsterStats {
  /** Monster identifier (SCREAMING_SNAKE_CASE) */
  id: string;
  /** Display name */
  name: string;
  /** D2 monster type classification */
  type: 'PHYSICAL' | 'MAGIC' | 'UNDEAD' | 'DEMON' | 'BEAST' | 'BOSS' | 'UBER';
  /** Base stats: [Normal, Nightmare, Hell] */
  hp: DifficultyArray<number>;
  defense: DifficultyArray<number>;
  ar: DifficultyArray<number>;  // Attack Rating
  xp: DifficultyArray<number>;
  /** Elemental resistances: [Normal, Nightmare, Hell] */
  resistances: {
    physical: DifficultyArray<number>;
    fire: DifficultyArray<number>;
    cold: DifficultyArray<number>;
    lightning: DifficultyArray<number>;
    poison: DifficultyArray<number>;
  };
  /** Effectiveness of drain/life steal: [Normal, Nightmare, Hell] */
  drainEffectiveness: DifficultyArray<number>;
  /** Effectiveness of chill/slow: [Normal, Nightmare, Hell] */
  chillEffectiveness: DifficultyArray<number>;
  /** Minimum monster level for spawning */
  minLevel: DifficultyArray<number>;
  /** Velocity 1-5 (movement speed) */
  velocity: number;
}

// ─── Act 1 Monsters ───────────────────────────────────────────────────────

/** ZOMBIE — Undead tank, cold immune in Hell. High defense, low speed. */
export const ZOMBIE: Act1MonsterStats = {
  id: 'ZOMBIE',
  name: 'Zombie',
  type: 'UNDEAD',
  hp: [45, 320, 2850],
  defense: [12, 95, 480],
  ar: [35, 280, 1450],
  xp: [33, 420, 4200],
  resistances: {
    physical: [50, 50, 50],
    fire: [10, 15, 25],
    cold: [10, 55, 105],      // Cold immune in Hell
    lightning: [0, 10, 20],
    poison: [0, 10, 15],
  },
  drainEffectiveness: [100, 50, 25],   // Drain severely reduced in Hell
  chillEffectiveness: [100, 60, 10],   // Nearly immune to chill in Hell
  minLevel: [1, 36, 67],
  velocity: 1,
};

/** QUILL_RAT — Beast, projectile attacker. No immunities but scales fast. */
export const QUILL_RAT: Act1MonsterStats = {
  id: 'QUILL_RAT',
  name: 'Quill Rat',
  type: 'BEAST',
  hp: [18, 145, 1280],
  defense: [5, 42, 215],
  ar: [25, 195, 1020],
  xp: [21, 265, 2650],
  resistances: {
    physical: [50, 50, 50],
    fire: [10, 20, 45],
    cold: [0, 30, 50],
    lightning: [10, 25, 50],
    poison: [0, 10, 25],
  },
  drainEffectiveness: [100, 75, 50],
  chillEffectiveness: [100, 80, 60],
  minLevel: [1, 36, 67],
  velocity: 4,
};

/** SPIKE_FIEND — Demon, packs with Fallen Shaman. Melee burst damage. */
export const SPIKE_FIEND: Act1MonsterStats = {
  id: 'SPIKE_FIEND',
  name: 'Spike Fiend',
  type: 'DEMON',
  hp: [28, 220, 1950],
  defense: [8, 68, 350],
  ar: [45, 350, 1820],
  xp: [28, 355, 3550],
  resistances: {
    physical: [30, 30, 30],
    fire: [25, 45, 75],
    cold: [15, 25, 40],
    lightning: [5, 15, 30],
    poison: [10, 20, 35],
  },
  drainEffectiveness: [100, 65, 35],
  chillEffectiveness: [100, 70, 45],
  minLevel: [3, 38, 69],
  velocity: 3,
};

/** SKELETON_ARCHER — Undead, ranged attacker. Low melee stats. */
export const SKELETON_ARCHER: Act1MonsterStats = {
  id: 'SKELETON_ARCHER',
  name: 'Skeleton Archer',
  type: 'UNDEAD',
  hp: [22, 175, 1560],
  defense: [10, 85, 430],
  ar: [55, 420, 2180],
  xp: [25, 315, 3150],
  resistances: {
    physical: [40, 40, 40],
    fire: [15, 20, 30],
    cold: [20, 55, 110],      // Cold immune in Hell
    lightning: [5, 15, 25],
    poison: [10, 15, 20],
  },
  drainEffectiveness: [100, 50, 15],   // Minimal drain in Hell
  chillEffectiveness: [100, 50, 5],    // Chill nearly useless in Hell
  minLevel: [5, 40, 70],
  velocity: 2,
};

// ─── Act 1 Registry ───────────────────────────────────────────────────────

/** All Act 1 monster stat blocks */
export const ACT1_MONSTERS: readonly Act1MonsterStats[] = [
  ZOMBIE,
  QUILL_RAT,
  SPIKE_FIEND,
  SKELETON_ARCHER,
] as const;

/** Lookup by ID */
export function getAct1MonsterById(id: string): Act1MonsterStats | undefined {
  return ACT1_MONSTERS.find(m => m.id === id);
}

/** Get monster stats for a specific difficulty */
export function getStatsForDifficulty(
  monster: Act1MonsterStats,
  tier: 'normal' | 'nightmare' | 'hell'
): {
  hp: number;
  defense: number;
  ar: number;
  xp: number;
  resistances: {
    physical: number;
    fire: number;
    cold: number;
    lightning: number;
    poison: number;
  };
  drainEffectiveness: number;
  chillEffectiveness: number;
  minLevel: number;
} {
  const idx: Record<string, number> = { normal: 0, nightmare: 1, hell: 2 };
  const i = idx[tier] ?? 0;
  return {
    hp: monster.hp[i],
    defense: monster.defense[i],
    ar: monster.ar[i],
    xp: monster.xp[i],
    resistances: {
      physical: monster.resistances.physical[i],
      fire: monster.resistances.fire[i],
      cold: monster.resistances.cold[i],
      lightning: monster.resistances.lightning[i],
      poison: monster.resistances.poison[i],
    },
    drainEffectiveness: monster.drainEffectiveness[i],
    chillEffectiveness: monster.chillEffectiveness[i],
    minLevel: monster.minLevel[i],
  };
}

/** Hell immunities: returns monsters with ≥100 resistance in a given element */
export function getHellImmunes(element: keyof Act1MonsterStats['resistances']): Act1MonsterStats[] {
  return ACT1_MONSTERS.filter(m => m.resistances[element][2] >= 100);
}
