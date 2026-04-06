import type { Item } from "../state/types";
import Decimal from "break_infinity.js";
import { rngFloat } from "./prng";

// ─── Rarity Engine (Isolated) ─────────────────────────────────────────────
// Weights: 80% Normal, 15% Magic, 4.5% Rare, 0.5% Unique
// Deterministic weighted selection via xoshiro256** rngFloat.
// ───────────────────────────────────────────────────────────────────────────

export type Rarity = "Normal" | "Magic" | "Rare" | "Unique";

const RARITY_TABLE: [Rarity, number][] = [
  ["Normal", 800],
  ["Magic", 150],
  ["Rare", 45],
  ["Unique", 5],
];

const RARITY_TOTAL = 1000; // 800 + 150 + 45 + 5

/**
 * Roll a rarity tier using xoshiro256** PRNG.
 * Accepts an optional rngFloat for testing; defaults to prng.rngFloat.
 */
export function rollRarity(rng?: (max: number) => number): Rarity {
  const fn = rng ?? rngFloat;
  const threshold = fn(RARITY_TOTAL);
  let cumulative = 0;
  for (const [rarity, weight] of RARITY_TABLE) {
    cumulative += weight;
    if (threshold < cumulative) return rarity;
  }
  return "Normal";
}

export type { Item };

const RARITY_STAT_BONUS: Record<Rarity, number> = {
  Normal: 1.0,
  Magic: 1.3,
  Rare: 1.7,
  Unique: 2.5,
};

/**
 * Apply rarity modifiers to an item in-place.
 * Sets item.rarity and scales item.stats by rarity multiplier.
 */
export function applyRarity(item: Item, rarity: Rarity): void {
  item.rarity = rarity;
  const bonus = RARITY_STAT_BONUS[rarity];
  if (item.stats) {
    for (const key of Object.keys(item.stats)) {
      const val = item.stats[key];
      if (val) {
        item.stats[key] = val.mul(bonus);
      }
    }
  }
}

/** Full pipeline: roll rarity, apply to item, return it. */
export function rollAndApplyRarity(item: Item, rng?: (max: number) => number): Item {
  const rarity = rollRarity(rng);
  applyRarity(item, rarity);
  return item;
}
