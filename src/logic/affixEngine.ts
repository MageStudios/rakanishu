// src/logic/affixEngine.ts
// Mage Studios Law: Pure deterministic generation. No Math.random().
import { rngIntP } from './prng';
import type { InventoryEntry } from '../state/gameState';

const PREFIXES = [
  { name: 'Stout', stats: { defense: 5, weight: 1 } },
  { name: 'Savage', stats: { damageMin: 2, damageMax: 5 } },
  { name: 'Boreal', stats: { damageMin: 1, damageMax: 3 } }, // Cold proxy
];

const SUFFIXES = [
  { name: 'of Leeching', stats: { leechPct: 5 } },
  { name: 'of the Bear', stats: { strength: 10 } },
  { name: 'of Alacrity', stats: { speed: 2 } },
];

/**
 * Mutates drop with a random Magic quality prefix and suffix.
 * Minimal Phase 3 implementation.
 */
export function applyAffixes(item: InventoryEntry): void {
  // Only apply to normal non-unique items for now (simplistic check)
  if (item.type === 'rune' || item.quality === 'unique' || item.quality === 'set') return;

  // 1 in 3 chance to become Magic
  if (rngIntP(1, 3) === 1) {
    item.quality = 'magic';
    
    // Choose prefix and suffix randomly
    const prefixIdx = rngIntP(0, PREFIXES.length - 1);
    const suffixIdx = rngIntP(0, SUFFIXES.length - 1);
    
    const prefix = PREFIXES[prefixIdx];
    const suffix = SUFFIXES[suffixIdx];

    item.name = `${prefix.name} ${item.name} ${suffix.name}`;

    // Apply stat boosts
    if (prefix.stats.damageMin || prefix.stats.damageMax) {
      if (!item.damage) item.damage = { min: 1, max: 2 };
      item.damage.min += prefix.stats.damageMin || 0;
      item.damage.max += prefix.stats.damageMax || 0;
    }
    if (prefix.stats.defense) {
      item.defense = (item.defense || 0) + prefix.stats.defense;
    }
    // Suffixes could append to item directly or require an 'stats' record, 
    // but right now it's just a proof of concept for the name and inline stats.
  }
}
