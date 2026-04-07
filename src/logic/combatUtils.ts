// src/logic/combatUtils.ts
// Low-level combat math: PRNG, config, damage calculation, status effects.
// Extracted from combatSystem.ts to prevent bloat.

// ============================================================
// Xoshiro256++ PRNG — deterministic seed, zero dependencies
// ============================================================

export class Xoshiro256pp {
  private s: Uint32Array;

  constructor(seed: number) {
    this.s = new Uint32Array(4);
    let s0 = seed || 1;
    let s1 = (s0 ^ 0x12345678) * 0x5BD1E995 + seed;
    this.s[0] = s0 >>> 0;
    this.s[1] = s1 >>> 0;
    this.s[2] = ((s0 + s1) * 0x5BD1E995) >>> 0;
    this.s[3] = ((s0 + s1) * 0x5BD1E995) >>> 0;
  }

  next(): number {
    const s = this.s;
    const sl = (a: number, b: number) => (a << b) >>> 0;
    const sr = (a: number, b: number) => a >>> b;
    const xo = (a: number, b: number) => (a ^ b) >>> 0;
    const result = sl(xo(s[0], s[3]), 7) + s[0];
    const t = sl(s[1], 9) & 0xFFFFFFFF;
    s[2] = xo(s[2], s[0]);
    s[3] = xo(s[3], s[1]);
    s[1] = xo(s[1], s[2]);
    s[0] = xo(s[0], s[3]);
    s[2] = xo(s[2], t);
    s[3] = sl(s[3], 11);
    return result >>> 0;
  }

  nextFloat(max: number): number {
    return (this.next() & 0x1FFFFFFF) / (0x10000000 / max);
  }

  nextInt(min: number, max: number): number {
    return min + (this.next() % (max - min + 1));
  }
}

// Singleton PRNG — seed 1337 for deterministic combat
const rng = new Xoshiro256pp(1337);

// ============================================================
// Combat Config
// ============================================================

export interface CombatConfig {
  baseDamageMin: number;
  baseDamageMax: number;
  critThreshold: { physical: number; magic: number };
  critMultiplier: number;
}

export const COMBAT_CONFIG: CombatConfig = {
  baseDamageMin: 2,
  baseDamageMax: 8,
  critThreshold: { physical: 0.15, magic: 0.25 },
  critMultiplier: 2.5,
};

// ============================================================
// Combatant State — mirrors the engine's internal shape
// ============================================================

export interface CombatantState {
  name: string;
  hp: number;
  maxHp: number;
  strength: number;
  agility: number;
  intellect: number;
  defense: number;
  speed: number;
  type: 'PHYSICAL' | 'MAGIC';
  /** D2 monster family — maps from MonsterBlueprint.type */
  monsterType?: 'UNDEAD' | 'DEMON' | 'BEAST' | 'HUMAN';
  /** Encounter tier — used for XP/multiplier scaling */
  quality?: 'NORMAL' | 'CHAMPION' | 'UNIQUE' | 'BOSS' | 'UBER';
}

// ============================================================
// Companion Snapshot — injected from gameState
// ============================================================

export interface CompanionSnapshot {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  speed: number;
  strength: number;
  agility: number;
  intellect: number;
  defense: number;
  type: 'PHYSICAL' | 'MAGIC';
  skills: string[];
}

// ============================================================
// Damage Calculation
// ============================================================

export function calculateDamage(
  attacker: CombatantState,
  defender: CombatantState,
): { damage: number; isCrit: boolean; type: 'PHYSICAL' | 'MAGIC' } {
  const baseRange = COMBAT_CONFIG.baseDamageMax - COMBAT_CONFIG.baseDamageMin;
  const variance = Math.floor((rng.nextInt(-2, 2) * baseRange) / 10);
  let rawDamage = COMBAT_CONFIG.baseDamageMin + baseRange + variance;
  rawDamage = Math.max(COMBAT_CONFIG.baseDamageMin, rawDamage);

  const critChance = attacker.type === 'PHYSICAL'
    ? COMBAT_CONFIG.critThreshold.physical
    : COMBAT_CONFIG.critThreshold.magic;
  const critRoll = rng.nextFloat(1.0);

  let finalDamage = rawDamage;
  let isCrit = false;

  if (critRoll < critChance) {
    finalDamage = Math.floor(rawDamage * COMBAT_CONFIG.critMultiplier);
    isCrit = true;
  }

  const mitigation = defender.defense * 0.1;
  finalDamage = Math.max(1, Math.floor(finalDamage - mitigation));

  return { damage: finalDamage, isCrit, type: attacker.type };
}

// ============================================================
// CHILL Status Effect
// ============================================================

/** CHILL stack applied to enemy. Reduces speed by 15% per stack, max 5. */
export interface ChillEffect {
  stacks: number;
  /** Effective speed after chill reduction */
  debuffedSpeed: number;
}

/**
 * Calculate CHILL debuff on enemy speed.
 * Each stack: −15% multiplicative slow. Max 5 stacks.
 * Speed is clamped to a minimum of 1.
 */
export function applyChillToEnemy(baseSpeed: number, currentStacks: number): ChillEffect {
  const clamped = Math.min(currentStacks, 5);
  const multiplier = 1 - 0.15 * clamped;
  const debuffedSpeed = Math.max(1, Math.floor(baseSpeed * multiplier));
  return { stacks: clamped, debuffedSpeed };
}

// ============================================================
// Exports
// ============================================================

export function getRng(): Xoshiro256pp {
  return rng;
}
