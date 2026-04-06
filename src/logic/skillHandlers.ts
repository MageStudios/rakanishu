// src/logic/skillHandlers.ts
// Companion skill execution: Jab (multi-hit) and Cold Arrow (CHILL application).
// Pure functions — no side effects, no global state access.

import { COMBAT_CONFIG, getRng, type ChillEffect, CombatantState, CompanionSnapshot } from './combatUtils';

// ============================================================
// Jab — Shakira's 3-hit spear combo
// ============================================================

export interface JabHitResult {
  damage: number;
  isCrit: boolean;
  message: string;
  /** true if this hit was cancelled because the enemy is already dead */
  cancelled: boolean;
}

/**
 * Execute Jab: 3 consecutive attack rolls against the enemy.
 *
 * GHOST-HIT PREVENTION: If the enemy dies on hit 1 or 2,
 * remaining hits are cancelled (returned with `cancelled: true`).
 *
 * Damage uses Shakira's Jab ability stats (5-10 base) scaled by strength.
 */
export function handleJab(
  shakira: CompanionSnapshot,
  enemy: CombatantState,
  currentEnemyHp: number,
): JabHitResult[] {
  const rng = getRng();
  const jabAbility = shakira.skills.includes('Jab');
  // If Jab isn't unlocked, fall back to basic attack
  const config = jabAbility
    ? { baseMin: 5, baseMax: 10 }
    : { baseMin: COMBAT_CONFIG.baseDamageMin, baseMax: COMBAT_CONFIG.baseDamageMax };

  const hits: JabHitResult[] = [];
  let workingHp = currentEnemyHp;
  const MAX_HITS = 3;

  for (let i = 0; i < MAX_HITS; i++) {
    if (workingHp <= 0) {
      // Enemy already dead — cancel remaining hits
      hits.push({
        damage: 0,
        isCrit: false,
        message: `Jab hit ${i + 1} cancelled (enemy already slain)`,
        cancelled: true,
      });
      continue;
    }

    // Calculate Jab damage
    const baseRange = config.baseMax - config.baseMin;
    const variance = Math.floor((rng.nextInt(-2, 2) * baseRange) / 10);
    let rawDamage = config.baseMin + baseRange + variance;
    rawDamage = Math.max(config.baseMin, rawDamage);

    // Strength scaling: +0.5 per strength point
    rawDamage += shakira.strength * 0.5;

    // Crit roll
    const critRoll = rng.nextFloat(1.0);
    let finalDamage = rawDamage;
    let isCrit = false;

    if (critRoll < COMBAT_CONFIG.critThreshold.physical) {
      finalDamage = Math.floor(rawDamage * COMBAT_CONFIG.critMultiplier);
      isCrit = true;
    }

    // Defense mitigation
    const mitigation = enemy.defense * 0.1;
    finalDamage = Math.max(1, Math.floor(finalDamage - mitigation));

    workingHp -= finalDamage;

    const hitLabel = i + 1;
    const critLabel = isCrit ? ' CRIT' : '';
    hits.push({
      damage: finalDamage,
      isCrit,
      message: `Shakira's Jab hit ${hitLabel}:${critLabel} ${finalDamage} DMG`,
      cancelled: false,
    });
  }

  return hits;
}

// ============================================================
// Cold Arrow — Kyra's frost shot with CHILL
// ============================================================

export interface ColdArrowResult {
  damage: number;
  isCrit: boolean;
  chill: ChillEffect;
  message: string;
}

/**
 * Execute Cold Arrow: Single-range attack + 1 stack of CHILL.
 *
 * CHILL math: Each stack reduces enemy speed by 15% multiplicatively.
 * Max 5 stacks. Applied via applyChillToEnemy from combatUtils.
 */
export function handleColdArrow(
  kyra: CompanionSnapshot,
  enemy: CombatantState,
  currentChillStacks: number,
): ColdArrowResult {
  const rng = getRng();
  const hasColdArrow = kyra.skills.includes('Cold Arrow');
  const config = hasColdArrow
    ? { baseMin: 4, baseMax: 8 }
    : { baseMin: COMBAT_CONFIG.baseDamageMin, baseMax: COMBAT_CONFIG.baseDamageMax };

  const baseRange = config.baseMax - config.baseMin;
  const variance = Math.floor((rng.nextInt(-2, 2) * baseRange) / 10);
  let rawDamage = config.baseMin + baseRange + variance;
  rawDamage = Math.max(config.baseMin, rawDamage);

  // Intellect scaling for cold damage
  rawDamage += kyra.intellect * 0.3;

  const critRoll = rng.nextFloat(1.0);
  let finalDamage = rawDamage;
  let isCrit = false;

  if (critRoll < COMBAT_CONFIG.critThreshold.magic) {
    finalDamage = Math.floor(rawDamage * COMBAT_CONFIG.critMultiplier);
    isCrit = true;
  }

  const mitigation = enemy.defense * 0.1;
  finalDamage = Math.max(1, Math.floor(finalDamage - mitigation));

  // Apply CHILL: +1 stack
  const chill = { stacks: Math.min(currentChillStacks + 1, 5), debuffedSpeed: 0 };
  // Calculate debuffed speed
  const multiplier = 1 - 0.15 * chill.stacks;
  chill.debuffedSpeed = Math.max(1, Math.floor(enemy.speed * multiplier));

  return {
    damage: finalDamage,
    isCrit,
    chill,
    message: isCrit
      ? `Kyra's Cold Arrow CRITs for ${finalDamage} DMG (CHILL ${chill.stacks})`
      : `Kyra's Cold Arrow: ${finalDamage} DMG (CHILL ${chill.stacks})`,
  };
}
