/* @refresh reload */
/**
 * Monster Level Scaling — Generator-Based (Levels 1–130+)
 *
 * Piecewise exponential generators anchored at exact D2 milestones:
 *   Lvl 1   → HP 7,    XP 15,       AC 2,    DMG 2
 *   Lvl 36  → HP 569,  XP 2345,     AC 80,   DMG 25
 *   Lvl 67  → HP 2870, XP 25 400,   AC 150,  DMG 55
 *   Lvl 110 → HP ~19 049, XP ~380 949 (Uber tier)
 */

export interface BaseStats {
  hp: number;
  xp: number;
  ac: number;
  dmg: number;
}

export type DifficultyTier = 'normal' | 'nightmare' | 'hell' | 'uber';

/**
 * Difficulty multipliers.
 *  uber = 7.5× = Hell (1.5×) × Uber flat 5× HP bonus.
 */
export const DIFFICULTY_MULT: Record<DifficultyTier, number> = {
  normal: 1.0,
  nightmare: 1.25,
  hell: 1.5,
  uber: 7.5,
};

// ── Piecewise generators ────────────────────────────────────────────────────

/** HP: 7 → 569 → 2 870 → extrapolation */
function _baseHp(level: number): number {
  if (level <= 1) return 7;
  if (level <= 36) return Math.floor(7 * Math.pow(1.13389238, level - 1));
  if (level <= 67) return Math.floor(569 * Math.pow(1.0535860, level - 36));
  return Math.floor(2870 * Math.pow(1.045, level - 67));
}

/** XP: 15 → 2 345 → 25 400 → extrapolation */
function _baseXp(level: number): number {
  if (level <= 1) return 15;
  if (level <= 36) return Math.floor(15 * Math.pow(1.15528, level - 1));
  if (level <= 67) return Math.floor(2345 * Math.pow(1.07988405, level - 36));
  return Math.floor(25400 * Math.pow(1.065, level - 67));
}

/** AC: linear, 2 → 80 → 150 → extrapolation */
function _baseAc(level: number): number {
  if (level <= 1) return 2;
  if (level <= 36) return Math.floor(2 + (level - 1) * ((80 - 2) / 35));
  if (level <= 67) return Math.floor(80 + (level - 36) * ((150 - 80) / 31));
  return Math.floor(150 + (level - 67) * ((220 - 150) / 43));
}

/** DMG: linear, 2 → 25 → 55 → extrapolation */
function _baseDmg(level: number): number {
  if (level <= 1) return 2;
  if (level <= 36) return Math.floor(2 + (level - 1) * ((25 - 2) / 35));
  if (level <= 67) return Math.floor(25 + (level - 36) * ((55 - 25) / 31));
  return Math.floor(55 + (level - 67) * ((100 - 55) / 43));
}

/** Generate base monster stats for any level 1–130+. */
export function getBaseStats(level: number): BaseStats {
  if (level < 1) return { hp: 1, xp: 0, ac: 1, dmg: 1 };
  return { hp: _baseHp(level), xp: _baseXp(level), ac: _baseAc(level), dmg: _baseDmg(level) };
}

/**
 * Scale a percentage modifier by generated base stats × difficulty.
 * Formula: `floor((baseMod * baseValue) / 100 × difficultyMult)`
 */
export function getScaledStat(
  baseMod: number,
  level: number,
  key: keyof BaseStats,
  tier: DifficultyTier = 'normal',
): number {
  const base = getBaseStats(level);
  return Math.floor((baseMod * base[key]) / 100 * DIFFICULTY_MULT[tier]);
}

// ── Monster Scaling Composite ───────────────────────────────────────────────

/** Full stat block for a monster at a given level/difficulty and party size. */
export function scaleMonsterStats(
  level: number,
  blueprint: { hpRatio: number; xpRatio: number; acRatio: number; dmgRatio: number },
  tier: DifficultyTier,
  partySize: number = 1,
): BaseStats {
  const partyMult = 1 + (partySize - 1) * 1.75;
  return {
    hp: Math.floor(getScaledStat(blueprint.hpRatio, level, 'hp', tier) * partyMult),
    xp: Math.floor(getScaledStat(blueprint.xpRatio, level, 'xp', tier) * partyMult),
    ac: getScaledStat(blueprint.acRatio, level, 'ac', tier),
    dmg: getScaledStat(blueprint.dmgRatio, level, 'dmg', tier),
  };
}

export function getDifficulty(tier: DifficultyTier): number {
  return DIFFICULTY_MULT[tier];
}

// ── Sunder Mechanics ────────────────────────────────────────────────────────

export interface ElementalResistances {
  physical: number;
  fire: number;
  cold: number;
  lightning: number;
  poison: number;
}

export type SunderableElement = keyof ElementalResistances;

export function applySunderToResistances(
  resistances: ElementalResistances,
  element: SunderableElement,
  breakAmount = 40,
): ElementalResistances {
  const out = { ...resistances };
  out[element] = Math.max(out[element] - breakAmount, 60);
  return out;
}

export const SUNDER_CHARMS: Record<SunderableElement, { name: string; breakAmount: number }> = {
  physical:  { name: "Sunder Physical Charm",  breakAmount: 40 },
  fire:      { name: "Sunder Fire Charm",      breakAmount: 40 },
  cold:      { name: "Sunder Cold Charm",      breakAmount: 40 },
  lightning: { name: "Sunder Lightning Charm", breakAmount: 40 },
  poison:    { name: "Sunder Poison Charm",    breakAmount: 40 },
};

export function getTypeSunderCharm(element: SunderableElement) {
  return SUNDER_CHARMS[element];
}
