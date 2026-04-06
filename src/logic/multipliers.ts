/* @refresh reload */
/**
 * MultiplierRegistry — Exponential scaling for Prestige Layer 1
 *
 * Pure module. No store mutations inside. Returns deltas that the
 * caller applies via path-based setters (Mage Studios Law).
 *
 * Design principles:
 * 1. Multiplicative stacking — each layer multiplies the base, never adds.
 * 2. Categories keep sources isolated (combat, drop, xp, speed, global).
 * 3. Sources within a category multiply together.
 * 4. All categories multiply together for the final output.
 * 5. Exponential decay on reset — a portion persists via "legacyMultiplier".
 * 6. Zero coupling to gameState — registry is a pure data structure.
 */

// ── Types ──────────────────────────────────────────────────────────────────

/** Recognized multiplier buckets. Extend when adding new prestige layers. */
export type MultiplierCategory =
  | 'damage'
  | 'defense'
  | 'experience'
  | 'gold'
  | 'magicFind'
  | 'speed'
  | 'global';

/** A single multiplicative source. */
export interface MultiplierEntry {
  source: string;   // unique identifier, e.g. "prestige_rank_5"
  factor: number;   // ≥ 1.0  (1.0 = no effect)
  label: string;    // human-readable, e.g. "Prestige Rank 5 (+50%)"
}

/** One category's full state. */
export interface CategoryBank {
  entries: MultiplierEntry[];
}

/** The full registry snapshot — serialisable for persistence. */
export interface MultiplierRegistryState {
  categories: Record<MultiplierCategory, CategoryBank>;
  legacyMultiplier: number;  // persists across full resets (≥ 1.0)
  prestigeCount: number;     // how many prestige resets performed
}

// ── Factory ────────────────────────────────────────────────────────────────

function emptyCategory(): CategoryBank {
  return { entries: [] };
}

export const DEFAULT_REGISTRY = ':registry';

export function createRegistry(): MultiplierRegistryState {
  return {
    categories: {
      damage: emptyCategory(),
      defense: emptyCategory(),
      experience: emptyCategory(),
      gold: emptyCategory(),
      magicFind: emptyCategory(),
      speed: emptyCategory(),
      global: emptyCategory(),
    },
    legacyMultiplier: 1.0,
    prestigeCount: 0,
  };
}

// ── Core Operations (pure) ────────────────────────────────────────────────

/** Register or update a multiplier source in a category. */
export function register(
  state: MultiplierRegistryState,
  category: MultiplierCategory,
  source: string,
  factor: number,
  label: string,
): MultiplierRegistryState {
  if (factor < 1.0) return state; // safety: never reduce
  const bank = state.categories[category];
  const idx = bank.entries.findIndex(e => e.source === source);
  const entry: MultiplierEntry = { source, factor, label };
  if (idx >= 0) {
    bank.entries[idx] = entry; // upsert
  } else {
    bank.entries.push(entry);
  }
  return state;
}

/** Remove a source from a category (e.g. consumable expired). */
export function deregister(
  state: MultiplierRegistryState,
  category: MultiplierCategory,
  source: string,
): MultiplierRegistryState {
  const bank = state.categories[category];
  bank.entries = bank.entries.filter(e => e.source !== source);
  return state;
}

/** Compute the product of all entries in one category. */
export function categoryMultiplier(state: MultiplierRegistryState, category: MultiplierCategory): number {
  const bank = state.categories[category];
  if (bank.entries.length === 0) return 1.0;
  let result = 1.0;
  for (const e of bank.entries) result *= e.factor;
  return result;
}

/** Full compounded multiplier for a single category × legacy × global. */
export function getMultiplier(state: MultiplierRegistryState, category: MultiplierCategory): number {
  return categoryMultiplier(state, category) * categoryMultiplier(state, 'global') * state.legacyMultiplier;
}

// ── Prestige Layer 1 ──────────────────────────────────────────────────────

/**
 * Perform a Prestige reset:
 * - Clears all category entries.
 * - Converts current accumulated multipliers into a legacy factor.
 * - Increments prestigeCount.
 * - legacyMultiplier compounds multiplicatively with the pre-reset total.
 *
 * This is the exponential scaling hook — each prestige compounds.
 */
export function performPrestige(state: MultiplierRegistryState): MultiplierRegistryState {
  // Compute total multiplier before reset
  let preReset = state.legacyMultiplier;
  for (const cat of Object.keys(state.categories) as MultiplierCategory[]) {
    preReset *= categoryMultiplier(state, cat);
  }

  // Legacy compounds: each prestige multiplies the persistent factor
  const newLegacy = preReset >= 1.0 ? preReset : 1.0;

  const newState: MultiplierRegistryState = {
    categories: {
      damage: emptyCategory(),
      defense: emptyCategory(),
      experience: emptyCategory(),
      gold: emptyCategory(),
      magicFind: emptyCategory(),
      speed: emptyCategory(),
      global: emptyCategory(),
    },
    legacyMultiplier: newLegacy,
    prestigeCount: state.prestigeCount + 1,
  };
  return newState;
}

// ── State Integration Helpers ─────────────────────────────────────────────

/**
 * Return the delta to apply via setGameState path setters.
 * Use this from gameState tick or action handlers:
 *
 *   setGameState('prestige', 'legacyMultiplier', registry.legacyMultiplier);
 *   setGameState('prestige', 'prestigeCount', registry.prestigeCount);
 */
export type PrestigeDelta = {
  legacyMultiplier: number;
  prestigeCount: number;
  categoryMultipliers: Record<MultiplierCategory, number>;
};

export function computePrestigeDelta(state: MultiplierRegistryState): PrestigeDelta {
  const categoryMultipliers = {} as Record<MultiplierCategory, number>;
  for (const cat of Object.keys(state.categories) as MultiplierCategory[]) {
    categoryMultipliers[cat] = getMultiplier(state, cat);
  }
  return {
    legacyMultiplier: state.legacyMultiplier,
    prestigeCount: state.prestigeCount,
    categoryMultipliers,
  };
}

/**
 * Generate the state patches to apply via path setters.
 * Each patch is a [path..., value] tuple for setGameState.
 */
export function patchesForDelta(delta: PrestigeDelta): Array<[string[], number | Record<string, number>]> {
  return [
    [['prestige', 'legacyMultiplier'], delta.legacyMultiplier],
    [['prestige', 'prestigeCount'], delta.prestigeCount],
    [['prestige', 'categoryMultipliers'], delta.categoryMultipliers],
  ];
}
