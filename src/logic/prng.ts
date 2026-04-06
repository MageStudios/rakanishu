/* @refresh reload */
/**
 * xoshiro256** / xoshiro256++ PRNG — Zero-import base module.
 * Mage Studios Law: No Math.random(). Single seeded state.
 *
 * xoshiro256**  → rotl(s0+s3, 23) + s0       (current loot/combat)
 * xoshiro256++  → rotl(s0+s3, 17) + s0       (affix generator — superior diffusion)
 */

const MASK = (1n << 64n) - 1n;

const rngState = new BigUint64Array(4);
(function seedRng() {
  crypto.getRandomValues(rngState);
  if (rngState.every(s => s === 0n)) rngState[0] = 0xBEEFn;
})();

function _rotl(x: bigint, k: bigint): bigint {
  return ((x << k) | (x >> (64n - k))) & MASK;
}

function _xoshiro256ss(): bigint {
  const result = (_rotl(rngState[0] + rngState[3], 23n) + rngState[0]) & MASK;
  const t = (rngState[1] << 17n) & MASK;
  rngState[2] ^= rngState[0];
  rngState[3] ^= rngState[1];
  rngState[1] ^= rngState[2];
  rngState[0] ^= rngState[3];
  rngState[2] ^= t;
  rngState[3] = _rotl(rngState[3], 45n);
  return result;
}

/** xoshiro256++ — one internal step, returns 64-bit raw. */
function _xoshiro256pp(): bigint {
  const result = (_rotl(rngState[0] + rngState[3], 17n) + rngState[0]) & MASK;
  const t = (rngState[1] << 17n) & MASK;
  rngState[2] ^= rngState[0];
  rngState[3] ^= rngState[1];
  rngState[1] ^= rngState[2];
  rngState[0] ^= rngState[3];
  rngState[2] ^= t;
  rngState[3] = _rotl(rngState[3], 45n);
  return result;
}

/** Random float in [0, max). Uses xoshiro256**. */
export function rngFloat(max: number): number {
  return Number(_xoshiro256ss() >> 11n) / 0x20000000000000 * max;
}

/** Random int in [min, max] (inclusive). Uses xoshiro256**. */
export function rngInt(min: number, max: number): number {
  return min + Number(_xoshiro256ss() % BigInt(max - min + 1));
}

/* ─── xoshiro256++ exports (affix / loot generator) ─── */

/** Random float in [0, max). Uses xoshiro256++. */
export function rngFloatP(max: number): number {
  return Number(_xoshiro256pp() >> 11n) / 0x20000000000000 * max;
}

/** Random int in [min, max] (inclusive). Uses xoshiro256++. */
export function rngIntP(min: number, max: number): number {
  return min + Number(_xoshiro256pp() % BigInt(max - min + 1));
}

/** Weighted selection: returns index of chosen entry. Uses xoshiro256++. */
export function rngWeighted(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return -1;
  let roll = rngFloatP(total);
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return i;
  }
  return weights.length - 1;
}
