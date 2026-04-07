/* @refresh reload */
/**
 * Monster Scaling System
 * Exponential growth formulas using Math.pow
 *
 * Verification values (for level 1, 30, 99):
 * - Level  1: HP = 25, DMG = 5–6
 * - Level 30: HP = 668, DMG = 46–60
 * - Level 99: HP = 1,664,585, DMG = 9,429–12,258
 */

export const SCALING_CONSTANTS = {
  HP_BASE: 25,
  HP_STEP: 1.12,
  DMG_BASE: 5,
  DMG_STEP: 1.08,
} as const;

export interface MonsterStats {
  hp: number;
  maxHp: number;
  damageMin: number;
  damageMax: number;
}

/**
 * Calculate monster stats based on level using exponential growth.
 * Formula: base * (step ^ (level - 1))
 *
 * @param level - Monster level (>= 1)
 * @returns Object with hp and damage stats
 */
export function calculateMonsterStats(level: number): MonsterStats {
  if (level < 1) {
    throw new Error(`Monster level must be >= 1, got ${level}`);
  }

  const hp = SCALING_CONSTANTS.HP_BASE * Math.pow(SCALING_CONSTANTS.HP_STEP, level - 1);
  const dmgMin = SCALING_CONSTANTS.DMG_BASE * Math.pow(SCALING_CONSTANTS.DMG_STEP, level - 1);
  const dmgMax = dmgMin * 1.3; // 30% variance for damage range

  return {
    hp: Math.floor(hp),
    maxHp: Math.floor(hp),
    damageMin: Math.floor(dmgMin),
    damageMax: Math.floor(dmgMax),
  };
}
