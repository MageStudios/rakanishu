/* @refresh reload */
/**
 * Player Stats Engine — Computed StatSheet
 * HP = Vit×2, MP = floor(Int×1.5). Flat + percent gear bonuses.
 * Reads gameState directly. No destructuring.
 */

import { gameState } from '../state/gameState';
import type { EquipmentState, InventoryEntry } from '../state/gameState';

// ─── Types ────────────────────────────────────────────────────────────────

export interface PlayerBaseStats {
  strength: number;
  agility: number;
  vitality: number;
  intellect: number;
}

export interface FlatBonuses {
  hp: number; mp: number;
  damageMin: number; damageMax: number; defense: number;
  strength: number; agility: number; vitality: number; intellect: number;
}

export interface PercentBonuses {
  hpPct: number; mpPct: number; damagePct: number; defensePct: number;
}

export interface EffectiveStats {
  maxHp: number; maxMp: number;
  damageMin: number; damageMax: number; defense: number;
  strength: number; agility: number; vitality: number; intellect: number;
}

// ─── Base Stats ───────────────────────────────────────────────────────────

export const DEFAULT_BASE_STATS: Readonly<PlayerBaseStats> = {
  strength: 5, agility: 2, vitality: 25, intellect: 10,
} as const;

const GROWTH = { vitality: 2, strength: 1, agility: 1, intellect: 1 } as const;

export function getPlayerBaseStats(): PlayerBaseStats {
  const g = gameState.player.level - 1;
  return {
    strength: DEFAULT_BASE_STATS.strength + g * GROWTH.strength,
    agility: DEFAULT_BASE_STATS.agility + g * GROWTH.agility,
    vitality: DEFAULT_BASE_STATS.vitality + g * GROWTH.vitality,
    intellect: DEFAULT_BASE_STATS.intellect + g * GROWTH.intellect,
  };
}

// ─── Gear Bonus Extraction ────────────────────────────────────────────────

function flat(item: InventoryEntry | null, key: string): number {
  return (item && key in item) ? (item as any)[key] ?? 0 : 0;
}

function extractItemBonuses(item: InventoryEntry | null, f: FlatBonuses, p: PercentBonuses): void {
  if (!item) return;
  if (item.damage) { f.damageMin += item.damage.min; f.damageMax += item.damage.max; }
  if (item.defense) { f.defense += item.defense; }
  f.strength += flat(item, 'bonusStr'); f.agility += flat(item, 'bonusAgi');
  f.vitality += flat(item, 'bonusVit'); f.intellect += flat(item, 'bonusInt');
  f.hp += flat(item, 'bonusHp'); f.mp += flat(item, 'bonusMp');
  p.damagePct += flat(item, 'dmgPct'); p.defensePct += flat(item, 'defPct');
  p.hpPct += flat(item, 'hpPct'); p.mpPct += flat(item, 'mpPct');
}

function getAllGearBonuses(): { flat: FlatBonuses; pct: PercentBonuses } {
  const eq = gameState.equipment as EquipmentState;
  const f: FlatBonuses = { hp: 0, mp: 0, damageMin: 0, damageMax: 0, defense: 0, strength: 0, agility: 0, vitality: 0, intellect: 0 };
  const p: PercentBonuses = { hpPct: 0, mpPct: 0, damagePct: 0, defensePct: 0 };
  extractItemBonuses(eq.weapon, f, p);
  extractItemBonuses(eq.armor, f, p);
  extractItemBonuses(eq.shield, f, p);
  extractItemBonuses(eq.helm, f, p);
  return { flat: f, pct: p };
}

// ─── Effective Stats ──────────────────────────────────────────────────────

export function calculateEffectiveStats(): EffectiveStats {
  const base = getPlayerBaseStats();
  const { flat: f, pct: p } = getAllGearBonuses();
  const ev = base.vitality + f.vitality, ei = base.intellect + f.intellect;
  return {
    maxHp: Math.floor((ev * 2 + f.hp) * (1 + p.hpPct)),
    maxMp: Math.floor((Math.floor(ei * 1.5) + f.mp) * (1 + p.mpPct)),
    damageMin: Math.floor((base.strength + f.damageMin) * (1 + p.damagePct)),
    damageMax: Math.floor((base.strength + f.damageMax) * (1 + p.damagePct)),
    defense: Math.floor((base.agility + f.defense) * (1 + p.defensePct)),
    strength: base.strength + f.strength,
    agility: base.agility + f.agility,
    vitality: ev,
    intellect: ei,
  };
}

export function getHpPercent(): number {
  const s = calculateEffectiveStats();
  return s.maxHp <= 0 ? 0 : (gameState.player.hp / s.maxHp) * 100;
}

export function getMpPercent(currentMp: number): number {
  const s = calculateEffectiveStats();
  return s.maxMp <= 0 ? 0 : (currentMp / s.maxMp) * 100;
}

export function getStatSummary() {
  const s = calculateEffectiveStats();
  return { hp: `${gameState.player.hp}/${s.maxHp}`, mp: `0/${s.maxMp}`,
    str: s.strength, agi: s.agility, vit: s.vitality, int: s.intellect,
    dmg: `${s.damageMin}-${s.damageMax}`, def: s.defense };
}


