/* @refresh reload */
/**
 * Affix Library — Diablo 2 Tiered Affix System
 *
 * Prefixes concatenate BEFORE the base: "King's" + "Scythe" = "King's Scythe"
 * Suffixes concatenate AFTER the base: "Scythe" + "of the Vampire" = "Scythe of the Vampire"
 * Full name: "King's Scythe of the Vampire"
 *
 * Each tier has a minLevel and Decimal multiplier for stat scaling.
 * Uses Xoshiro256++ for deterministic selection.
 */

import { ItemBaseEntry, getAllBases } from './items/bases';

// ─── Xoshiro256++ Seeded PRNG (local, non-global) ────────────────
const MASK64 = (1n << 64n) - 1n;

function _rotl64(x: bigint, k: bigint): bigint {
  return ((x << k) | (x >> (64n - k))) & MASK64;
}

function _step256pp(state: BigUint64Array): bigint {
  const result = (_rotl64(state[0] + state[3], 17n) + state[0]) & MASK64;
  const t = (state[1] << 17n) & MASK64;
  state[2] ^= state[0];
  state[3] ^= state[1];
  state[1] ^= state[2];
  state[0] ^= state[3];
  state[2] ^= t;
  state[3] = _rotl64(state[3], 45n);
  return result;
}

/** Seeded int in [min, max] inclusive using xoshiro256++. */
function _rngInt(state: BigUint64Array, min: number, max: number): number {
  return min + Number(_step256pp(state) % BigInt(max - min + 1));
}

// ─── Types ────────────────────────────────────────────────────────

export interface Affix {
  id: string;
  name: string;
  /** Minimum monster level required for this affix to be eligible. */
  minLevel: number;
  /** Decimal multiplier applied to base stats (e.g., 1.50 = +50%). */
  multiplier: number;
}

export interface GeneratedMagicItem {
  id: string;
  name: string;          // "King's Scythe of the Vampire"
  baseId: string;
  baseName: string;
  type: ItemBaseEntry['type'];
  slot: ItemBaseEntry['slot'];
  w: number;
  h: number;
  quality: 'magic';
  prefixId?: string;
  suffixId?: string;
  affixMult: number;
  ilvl: number;
  damage?: { min: number; max: number };
  defense?: number;
}

// ──────────────────────────────────────────────────────────────────
// PREFIXES — D2 Tiered (Bronze → Iron → Steel → King's → ...)
// ──────────────────────────────────────────────────────────────────

export const prefixes: Affix[] = [
  // Tier 1  (mlvl 1)
  { id: 'battered',  name: 'Battered',  minLevel: 1,  multiplier: 0.80 },
  { id: 'crude',     name: 'Crude',     minLevel: 1,  multiplier: 0.85 },
  { id: 'dented',    name: 'Dented',    minLevel: 1,  multiplier: 0.90 },

  // Tier 2  (mlvl 3) — Bronze tier
  { id: 'bronze',    name: 'Bronze',    minLevel: 3,  multiplier: 1.00 },
  { id: 'dull',      name: 'Dull',      minLevel: 3,  multiplier: 1.05 },
  { id: 'worn',      name: 'Worn',      minLevel: 3,  multiplier: 1.03 },

  // Tier 3  (mlvl 6) — Iron tier
  { id: 'iron',      name: 'Iron',      minLevel: 6,  multiplier: 1.20 },
  { id: 'sharpened', name: 'Sharpened', minLevel: 6,  multiplier: 1.25 },
  { id: 'honed',     name: 'Honed',     minLevel: 6,  multiplier: 1.23 },

  // Tier 4  (mlvl 10) — Steel tier
  { id: 'steel',     name: 'Steel',     minLevel: 10, multiplier: 1.40 },
  { id: 'fine',      name: 'Fine',      minLevel: 10, multiplier: 1.45 },
  { id: 'tempered',  name: 'Tempered',  minLevel: 10, multiplier: 1.43 },

  // Tier 5  (mlvl 15) — Silver tier
  { id: 'silver',    name: 'Silver',    minLevel: 15, multiplier: 1.60 },
  { id: 'heavy',     name: 'Heavy',     minLevel: 15, multiplier: 1.65 },
  { id: 'sturdy',    name: 'Sturdy',    minLevel: 15, multiplier: 1.63 },

  // Tier 6  (mlvl 20) — Gold tier
  { id: 'gold',      name: 'Gold',      minLevel: 20, multiplier: 1.80 },
  { id: 'mighty',    name: 'Mighty',    minLevel: 20, multiplier: 1.85 },
  { id: 'strong',    name: 'Strong',    minLevel: 20, multiplier: 1.83 },

  // Tier 7  (mlvl 25) — King's tier
  { id: 'kings',     name: "King's",    minLevel: 25, multiplier: 2.10 },
  { id: 'masters',   name: "Master's",  minLevel: 25, multiplier: 2.15 },
  { id: 'grand',     name: 'Grand',     minLevel: 25, multiplier: 2.13 },

  // Tier 8  (mlvl 30) — Emperor's tier
  { id: 'emperor',   name: "Emperor's", minLevel: 30, multiplier: 2.40 },
  { id: 'lords',     name: "Lord's",    minLevel: 30, multiplier: 2.45 },
  { id: 'noble',     name: "Noble",     minLevel: 30, multiplier: 2.43 },

  // Tier 9  (mlvl 36) — Arcane tier
  { id: 'arcane',    name: 'Arcane',    minLevel: 36, multiplier: 2.75 },
  { id: 'runed',     name: 'Runed',     minLevel: 36, multiplier: 2.80 },
  { id: 'runic',     name: 'Runic',     minLevel: 36, multiplier: 2.78 },

  // Tier 10 (mlvl 42) — Shadow tier
  { id: 'shadow',    name: 'Shadow',    minLevel: 42, multiplier: 3.20 },
  { id: 'dread',     name: 'Dread',     minLevel: 42, multiplier: 3.25 },
  { id: 'grim',      name: 'Grim',      minLevel: 42, multiplier: 3.22 },
];

// ──────────────────────────────────────────────────────────────────
// SUFFIXES — D2 Tiered (of the Wolf → Bear → Tiger → Vampire → ...)
// ──────────────────────────────────────────────────────────────────

export const suffixes: Affix[] = [
  // Tier 1  (mlvl 1)
  { id: 'of_swiftness',  name: 'of Swiftness',   minLevel: 1,  multiplier: 0.85 },
  { id: 'of_haste',      name: 'of Haste',        minLevel: 1,  multiplier: 0.80 },
  { id: 'of_fury',       name: 'of Fury',         minLevel: 1,  multiplier: 0.88 },

  // Tier 2  (mlvl 3) — Lesser
  { id: 'of_the_fox',    name: 'of the Fox',      minLevel: 3,  multiplier: 1.00 },
  { id: 'of_the_rat',    name: 'of the Rat',      minLevel: 3,  multiplier: 1.05 },
  { id: 'of_the_sparrow',name: 'of the Sparrow',  minLevel: 3,  multiplier: 1.03 },

  // Tier 3  (mlvl 7) — Minor
  { id: 'of_the_wolf',   name: 'of the Wolf',     minLevel: 7,  multiplier: 1.20 },
  { id: 'of_the_snake',  name: 'of the Snake',    minLevel: 7,  multiplier: 1.25 },
  { id: 'of_the_raven',  name: 'of the Raven',    minLevel: 7,  multiplier: 1.23 },

  // Tier 4  (mlvl 12) — Apprentice
  { id: 'of_the_bear',    name: 'of the Bear',     minLevel: 12, multiplier: 1.40 },
  { id: 'of_the_eagle',   name: 'of the Eagle',    minLevel: 12, multiplier: 1.45 },
  { id: 'of_the_boar',    name: 'of the Boar',     minLevel: 12, multiplier: 1.43 },

  // Tier 5  (mlvl 17) — Artisan
  { id: 'of_the_lion',    name: 'of the Lion',     minLevel: 17, multiplier: 1.60 },
  { id: 'of_the_tiger',   name: 'of the Tiger',    minLevel: 17, multiplier: 1.65 },
  { id: 'of_the_gorilla', name: 'of the Gorilla',  minLevel: 17, multiplier: 1.63 },

  // Tier 6  (mlvl 22) — Journeyman
  { id: 'of_the_giant',    name: 'of the Giant',     minLevel: 22, multiplier: 1.80 },
  { id: 'of_the_mammoth',  name: 'of the Mammoth',   minLevel: 22, multiplier: 1.85 },
  { id: 'of_the_golem',    name: 'of the Golem',     minLevel: 22, multiplier: 1.83 },

  // Tier 7  (mlvl 27) — Expert
  { id: 'of_the_vampire',   name: 'of the Vampire',   minLevel: 27, multiplier: 2.10 },
  { id: 'of_the_colossus',  name: 'of the Colossus',  minLevel: 27, multiplier: 2.15 },
  { id: 'of_the_banshee',   name: 'of the Banshee',   minLevel: 27, multiplier: 2.13 },

  // Tier 8  (mlvl 32) — Master
  { id: 'of_the_titan',    name: 'of the Titan',     minLevel: 32, multiplier: 2.40 },
  { id: 'of_the_hydra',    name: 'of the Hydra',     minLevel: 32, multiplier: 2.45 },
  { id: 'of_the_archmage', name: 'of the Archmage',  minLevel: 32, multiplier: 2.43 },

  // Tier 9  (mlvl 37) — Grand Master
  { id: 'of_destruction',  name: 'of Destruction',  minLevel: 37, multiplier: 2.75 },
  { id: 'of_the_wraith',   name: 'of the Wraith',   minLevel: 37, multiplier: 2.80 },
  { id: 'of_ruin',         name: 'of Ruin',         minLevel: 37, multiplier: 2.78 },

  // Tier 10 (mlvl 43) — Transcendent
  { id: 'of_the_abyss',     name: 'of the Abyss',     minLevel: 43, multiplier: 3.20 },
  { id: 'of_the_void',      name: 'of the Void',      minLevel: 43, multiplier: 3.25 },
  { id: 'of_the_demonlord', name: 'of the Demonlord', minLevel: 43, multiplier: 3.22 },
];

// ─── Generate Item Function ───────────────────────────────────────

/**
 * Generate a magic item via xoshiro256++ seeded PRNG.
 *
 * Algorithm:
 *   1. Pick a random base item (Scythe, Flail, etc.)
 *   2. Filter prefixes/suffixes where minLevel <= monsterLevel
 *   3. Pick 1 prefix + 1 suffix using xoshiro256++
 *   4. Concatenate: "{Prefix} {BaseName} {Suffix}"
 *   5. Compute scaled stats via Decimal multiplier product
 *
 * @param monsterLevel - The level of the monster that dropped this item
 * @param seed         - BigUint64Array of length 4 for deterministic selection
 * @returns A GeneratedMagicItem (never null — always falls back to a normal base)
 */
export function generateItem(
  monsterLevel: number,
  seed: BigUint64Array,
): GeneratedMagicItem {
  // Clone seed to avoid mutating the caller's state
  const state = new BigUint64Array(seed);

  // Step 1: Pick a base item
  const allBases = getAllBases();
  const base = allBases[_rngInt(state, 0, allBases.length - 1)];

  // Step 2: Filter affixes by monsterLevel
  const eligiblePrefixes = prefixes.filter(a => a.minLevel <= monsterLevel);
  const eligibleSuffixes = suffixes.filter(a => a.minLevel <= monsterLevel);

  // Fallback: no eligible affixes → plain base
  if (eligiblePrefixes.length === 0 || eligibleSuffixes.length === 0) {
    return {
      id: `normal_${base.id}`,
      name: base.name,
      baseId: base.id,
      baseName: base.name,
      type: base.type,
      slot: base.slot,
      w: base.w,
      h: base.h,
      quality: 'magic',             // still tagged as normal in spirit
      prefixId: undefined,
      suffixId: undefined,
      affixMult: 1.0,
      ilvl: monsterLevel,
      damage: base.damage ? { ...base.damage } : undefined,
      defense: base.defense,
    };
  }

  // Step 3: Pick prefix via xoshiro256++
  const prefix = eligiblePrefixes[_rngInt(state, 0, eligiblePrefixes.length - 1)];

  // Step 4: Pick suffix via xoshiro256++
  const suffix = eligibleSuffixes[_rngInt(state, 0, eligibleSuffixes.length - 1)];

  // Step 5: Concatenate → "King's Scythe of the Vampire"
  const fullName = `${prefix.name} ${base.name} ${suffix.name}`;

  // Step 6: Decimal multiplier (prefix × suffix)
  const affixMult = Math.round(prefix.multiplier * suffix.multiplier * 100) / 100;

  // Step 7: Scale base stats
  const damage = base.damage
    ? {
        min: Math.round(base.damage.min * affixMult),
        max: Math.round(base.damage.max * affixMult),
      }
    : undefined;
  const defense =
    base.defense !== undefined ? Math.round(base.defense * affixMult) : undefined;

  // Step 8: Item level = max(monsterLevel, prefix.minLevel, suffix.minLevel)
  const ilvl = Math.max(monsterLevel, prefix.minLevel, suffix.minLevel);

  return {
    id: `magic_${prefix.id}_${base.id}_${suffix.id}`,
    name: fullName,
    baseId: base.id,
    baseName: base.name,
    type: base.type,
    slot: base.slot,
    w: base.w,
    h: base.h,
    prefixId: prefix.id,
    suffixId: suffix.id,
    quality: 'magic',
    affixMult,
    ilvl,
    damage,
    defense,
  };
}
