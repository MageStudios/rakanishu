// src/logic/lootSystem.ts
// Drop Engine — Xoshiro256** + Weighted Selection + Boss Multipliers
// D2R-aligned: isSuperior flag instead of 'superior' quality tier.

import { Zone } from '../data/zones';
import { rngFloat, rngInt } from './prng';
import { rollTCItem, RUNE_NAMES } from '../data/treasureClasses';
import { gameState } from '../state/gameState';

// ───── Item Types ─────
export interface EquippedItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'shield' | 'helm';
  damage?: { min: number; max: number };
  defense?: number;
  weight: number;
  quality: 'normal' | 'low' | 'magic' | 'rare' | 'set' | 'unique' | 'crafted';
  isSuperior: boolean;
  isSocketed: boolean;
  runeSockets: number;
}

export interface InventoryItem extends EquippedItem {
  slot: number;
  isEquipped: boolean;
}

export interface RuneDrop {
  type: 'rune';
  name: string;
  tier: number;
}

export type DropResult = InventoryItem | RuneDrop | null;

// ───── Core Drop Function ─────
/**
 * Generates loot using the TC 3-87 system and exponential NoDrop scaling.
 * Multiplier increases rolls (Bosses/Uniques).
 */
export function generateDrop(areaLevel: number, zone?: Zone): DropResult[] {
  const multiplier = zone?.bossDropMultiplier ?? 1.0;
  const baseRolls = 1 + Math.floor(multiplier * 0.5);
  const extraRolls = multiplier > 2 ? Math.floor(rngFloat(multiplier)) : 0;
  const totalRolls = baseRolls + extraRolls;

  const drops: DropResult[] = [];

  // Determine the appropriate TC level based on areaLevel (Standard D2 logic: TC=lvl/3 rounded)
  const tcLevel = Math.min(87, Math.max(3, Math.floor(areaLevel / 3) * 3));

  for (let i = 0; i < totalRolls; i++) {
    // 1. Roll from the Treasure Class system (includes NoDrop scaling)
    const rollResult = rollTCItem(tcLevel, gameState.partySize);
    if (!rollResult) continue;

    // 2. Map TC roll → DropResult
    if (rollResult.rune) {
      drops.push({ 
        type: 'rune', 
        name: rollResult.rune, 
        tier: RUNE_NAMES.indexOf(rollResult.rune) + 1 
      });
      continue;
    }

    const selectedItem = rollResult.item;
    let quality = rollResult.quality as any;

    // Boss/Unique quality roll enhancement
    const qualityRoll = rngFloat(1);
    if (multiplier >= 3 && qualityRoll < 0.20) quality = 'rare';
    else if (multiplier >= 2 && qualityRoll < 0.35) quality = 'magic';

    // 10% superior roll — only for 'normal' quality items
    let isSuperior = false;
    if (quality === 'normal' && rngFloat(1) < 0.10) {
      isSuperior = true;
    }

    const sockets = multiplier >= 2 ? rngInt(1, 3) : (rngFloat(1) < 0.25 ? rngInt(1, 2) : 0);

    // Build final item instance
    let damage = selectedItem.damage ? { ...selectedItem.damage } : undefined;
    let defense = selectedItem.defense;

    if (isSuperior) {
      const bonus = 0.05 + rngFloat(0.15); // 5-20%
      if (damage) {
        damage.min = Math.round(damage.min * (1 + bonus));
        damage.max = Math.round(damage.max * (1 + bonus));
      }
      if (defense !== undefined) {
        defense = Math.round(defense * (1 + bonus));
      }
    }

    drops.push({
      id: selectedItem.id,
      name: selectedItem.name,
      type: selectedItem.type,
      weight: selectedItem.weight,
      damage,
      defense,
      quality,
      isSuperior,
      isSocketed: sockets > 0,
      runeSockets: sockets,
      slot: -1,
      isEquipped: false,
    } as InventoryItem);
  }

  return drops;
}

// ───── Socket Item with Rune (stub for runeword logic) ─────
export function socketItem(itemId: string, runeId: string): { success: boolean; message: string } {
  // TODO: Integrate with gameState inventory system
  const runeIdx = RUNE_NAMES.findIndex(name => name.toLowerCase() === runeId.toLowerCase());
  if (runeIdx === -1) return { success: false, message: `Rune "${runeId}" not found` };
  
  return {
    success: false,
    message: `[TODO] ${RUNE_NAMES[runeIdx]} socketed into ${itemId}. Runeword logic pending.`,
  };
}
