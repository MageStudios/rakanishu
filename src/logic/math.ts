/* @refresh reload */
/**
 * Math Core — break_infinity.js wrapper.
 * Mage Studios Law: All scaling stats use Decimal. No raw number arithmetic
 * for damage, defense, or affix multipliers beyond trivial (0-100) ranges.
 */

import Decimal from 'break_infinity.js';

// ── Decimal helpers ─────────────────────────────────────────────────────────

/** Convert any value to a Decimal (safe for number, string, or already Decimal). */
export function toDecimal(val: Decimal | number | string): Decimal {
  return Decimal.fromValue(val);
}

/**
 * Format a Decimal for display.
 * - < 1 000 → plain (e.g., "42")
 * - < 1 000 000 → locale string (e.g., "1 234 567")
 * - ≥ 1 M → scientific (e.g., "1.23e6")
 */
export function format(val: Decimal | number | string): string {
  const d = toDecimal(val);
  if (d.lt(1000)) return d.toFixed(0);
  if (d.lt(1e6)) return d.round().toLocaleString();
  return d.toExponential(2);
}

/** Format with a suffix (+% or flat). Returns the string ready for UI. */
export function formatAffix(val: Decimal | number, asPercent: boolean): string {
  const d = toDecimal(val);
  if (asPercent) {
    const pct = d.minus(1).times(100);
    return `${pct.gt(0) ? '+' : ''}${pct.toFixed(1)}%`;
  }
  return format(d);
}

// ── Multiplicative chain helper ─────────────────────────────────────────────

/**
 * Chain-multiply a base Decimal by a series of multipliers.
 * Example: chainMul(base, 1.15, 1.10, 1.05) → base × 1.15 × 1.10 × 1.05
 */
export function chainMul(base: Decimal | number, ...multipliers: (Decimal | number)[]): Decimal {
  let result = toDecimal(base);
  for (const m of multipliers) {
    result = result.times(toDecimal(m));
  }
  return result;
}

export { Decimal };
