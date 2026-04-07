/* @refresh reload */
/**
 * Act 2 Monster Stat Blocks — Array-Based Format
 *
 * Desert, Dry Hills, Far Oasis, Tal Rasha's Tombs.
 * Uses [Normal, Nightmare, Hell] arrays for all difficulty-dependent values.
 * Resistances can exceed 100 (e.g., 105 = immunity + 5% overcap).
 * Full stat blocks: HP, Defense, AR, XP per difficulty tier.
 */

// ─── Types ────────────────────────────────────────────────────────────────

/** Difficulty-indexed array: [Normal, Nightmare, Hell] */
export type DifficultyArray<T> = [T, T, T];

export interface Act2MonsterStats {
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

// ─── Act 2 Monsters ───────────────────────────────────────────────────────

/** SAND_MAGGOT — Physical burrower. Poison immune in Nightmare+. Ambush predator. */
export const SAND_MAGGOT: Act2MonsterStats = {
  id: 'SAND_MAGGOT',
  name: 'Sand Maggot',
  type: 'PHYSICAL',
  hp: [280, 1200, 7500],
  defense: [85, 680, 4500],
  ar: [220, 1800, 12000],
  xp: [180, 1400, 8500],
  resistances: {
    physical: [10, 30, 60],
    fire: [5, 20, 50],
    cold: [0, 15, 45],
    lightning: [5, 25, 55],
    poison: [75, 100, 125],      // Poison immune in NM+, overcap in Hell
  },
  drainEffectiveness: [80, 50, 20],
  chillEffectiveness: [70, 40, 15],
  minLevel: [13, 38, 68],
  velocity: 1,
};

/** FLESH_HUNTER — Undead tomb raider. Life drain focused. Low drain effectiveness by Hell. */
export const FLESH_HUNTER: Act2MonsterStats = {
  id: 'FLESH_HUNTER',
  name: 'Flesh Hunter',
  type: 'UNDEAD',
  hp: [250, 1050, 6800],
  defense: [95, 760, 5200],
  ar: [260, 2100, 14000],
  xp: [200, 1600, 9800],
  resistances: {
    physical: [15, 35, 70],
    fire: [0, 20, 55],
    cold: [5, 25, 60],
    lightning: [10, 30, 65],
    poison: [20, 50, 90],
  },
  drainEffectiveness: [20, 5, 0],       // Nearly immune to drain in Hell
  chillEffectiveness: [60, 30, 10],
  minLevel: [14, 40, 70],
  velocity: 2,
};

/** SCARAB_BEETLE — Beast, swarm type. Very low HP but fastest in Act 2. Cold immune in Hell. */
export const SCARAB_BEETLE: Act2MonsterStats = {
  id: 'SCARAB_BEETLE',
  name: 'Scarab Beetle',
  type: 'BEAST',
  hp: [85, 360, 2300],
  defense: [65, 500, 3400],
  ar: [180, 1400, 9500],
  xp: [120, 900, 5500],
  resistances: {
    physical: [5, 15, 35],
    fire: [10, 30, 70],
    cold: [0, 20, 105],      // Cold immune in Hell
    lightning: [5, 20, 50],
    poison: [15, 40, 80],
  },
  drainEffectiveness: [100, 70, 40],
  chillEffectiveness: [80, 50, 20],
  minLevel: [13, 38, 69],
  velocity: 5,
};

/** CLAW_FIGHTER — Physical desert warrior. High AR, chill nearly useless in Hell. */
export const CLAW_FIGHTER: Act2MonsterStats = {
  id: 'CLAW_FIGHTER',
  name: 'Claw Fighter',
  type: 'PHYSICAL',
  hp: [300, 1350, 8500],
  defense: [110, 880, 6000],
  ar: [310, 2500, 17000],
  xp: [220, 1750, 11000],
  resistances: {
    physical: [20, 40, 80],
    fire: [5, 15, 45],
    cold: [10, 30, 65],
    lightning: [5, 20, 50],
    poison: [10, 35, 75],
  },
  drainEffectiveness: [85, 55, 25],
  chillEffectiveness: [25, 10, 0],      // Chill nearly useless in Hell
  minLevel: [15, 42, 72],
  velocity: 3,
};

/** MUMMY — Undeed magic user. Cursed hexes. Poison immune in Nightmare+. */
export const MUMMY: Act2MonsterStats = {
  id: 'MUMMY',
  name: 'Mummy',
  type: 'UNDEAD',
  hp: [200, 850, 5500],
  defense: [70, 560, 3800],
  ar: [190, 1500, 10500],
  xp: [240, 1900, 12500],
  resistances: {
    physical: [5, 20, 45],
    fire: [15, 45, 85],
    cold: [5, 25, 55],
    lightning: [10, 35, 70],
    poison: [50, 100, 120],     // Poison immune in NM+, overcap in Hell
  },
  drainEffectiveness: [30, 10, 0],       // Immune to drain in Hell
  chillEffectiveness: [65, 35, 15],
  minLevel: [16, 44, 74],
  velocity: 2,
};

/** DURIEL — UBER boss. Lord of Pain. Guardian of Tal Rasha's prison. */
export const DURIEL: Act2MonsterStats = {
  id: 'DURIEL',
  name: 'Duriel',
  type: 'UBER',
  hp: [3500, 28000, 200000],
  defense: [250, 2000, 14000],
  ar: [500, 4200, 28000],
  xp: [5000, 150000, 2000000],
  resistances: {
    physical: [40, 65, 95],
    fire: [30, 60, 90],
    cold: [50, 80, 110],        // Cold immune in Hell
    lightning: [35, 65, 95],
    poison: [45, 75, 105],      // Poison immune in Hell
  },
  drainEffectiveness: [10, 0, 0],
  chillEffectiveness: [0, 0, 0],       // Fully immune to chill
  minLevel: [18, 45, 76],
  velocity: 1,
};

// ─── Act 2 Registry ───────────────────────────────────────────────────────

/** All Act 2 monster stat blocks */
export const ACT2_MONSTERS: readonly Act2MonsterStats[] = [
  SAND_MAGGOT,
  FLESH_HUNTER,
  SCARAB_BEETLE,
  CLAW_FIGHTER,
  MUMMY,
  DURIEL,
] as const;

/** Lookup by ID */
export function getAct2MonsterById(id: string): Act2MonsterStats | undefined {
  return ACT2_MONSTERS.find(m => m.id === id);
}

/** Get monster stats for a specific difficulty */
export function getAct2StatsForDifficulty(
  monster: Act2MonsterStats,
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

/** Hell immunities: returns Act 2 monsters with ≥100 resistance in a given element */
export function getAct2HellImmunes(element: keyof Act2MonsterStats['resistances']): Act2MonsterStats[] {
  return ACT2_MONSTERS.filter(m => m.resistances[element][2] >= 100);
}
