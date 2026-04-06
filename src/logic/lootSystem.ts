// src/logic/lootSystem.ts
// Drop Engine — Xoshiro256** + Weighted Selection + Boss Multipliers
// D2R-aligned: isSuperior flag instead of 'superior' quality tier.

import { Zone } from '../data/zones';
import { rngFloat, rngInt } from './prng';

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

// ───── Item Pool (level-gated, sourced from D2 normal-tier bases) ─────
interface ItemPoolEntry {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'shield' | 'helm';
  damage?: { min: number; max: number };
  defense?: number;
  weight: number;
  areaLevelReq: number;
}

const ITEM_POOL: ItemPoolEntry[] = [
  // Level 1-2 (Blood Moor / Den of Evil)
  { id: 'short_sword', name: 'Short Sword', type: 'weapon', damage: { min: 4, max: 6 }, weight: 3, areaLevelReq: 1 },
  { id: 'hatchet', name: 'Hatchet', type: 'weapon', damage: { min: 3, max: 8 }, weight: 3, areaLevelReq: 1 },
  { id: 'cap', name: 'Cap', type: 'helm', defense: 2, weight: 1.5, areaLevelReq: 1 },
  { id: 'buckler', name: 'Buckler', type: 'shield', defense: 5, weight: 5, areaLevelReq: 1 },

  // Level 3 (Cold Plains / Burial Grounds)
  { id: 'short_bow', name: 'Short Bow', type: 'weapon', damage: { min: 3, max: 6 }, weight: 1.5, areaLevelReq: 3 },
  { id: 'leather_armor', name: 'Leather Armor', type: 'armor', defense: 5, weight: 6, areaLevelReq: 3 },
  { id: 'skull_cap', name: 'Skull Cap', type: 'helm', defense: 5, weight: 2, areaLevelReq: 3 },

  // Level 4-5 (Stony Field / Cave / Dark Wood)
  { id: 'long_sword', name: 'Long Sword', type: 'weapon', damage: { min: 3, max: 10 }, weight: 4, areaLevelReq: 4 },
  { id: 'hand_axe', name: 'Hand Axe', type: 'weapon', damage: { min: 3, max: 7 }, weight: 4, areaLevelReq: 4 },
  { id: 'shield', name: 'Shield', type: 'shield', defense: 10, weight: 7, areaLevelReq: 4 },
  { id: 'broad_sword', name: 'Broad Sword', type: 'weapon', damage: { min: 6, max: 9 }, weight: 5, areaLevelReq: 5 },
  { id: 'heavy_armor', name: 'Heavy Armor', type: 'armor', defense: 12, weight: 14, areaLevelReq: 5 },
  { id: 'helm', name: 'Helm', type: 'helm', defense: 7, weight: 3, areaLevelReq: 5 },

  // Level 6-7 (Dark Wood / Black Marsh / Tamoe / Passage / Cave / Tristram)
  { id: 'hunters_bow', name: "Hunter's Bow", type: 'weapon', damage: { min: 4, max: 8 }, weight: 2, areaLevelReq: 6 },
  { id: 'long_bow', name: 'Long Bow', type: 'weapon', damage: { min: 3, max: 10 }, weight: 4, areaLevelReq: 6 },
  { id: 'kite_shield', name: 'Kite Shield', type: 'shield', defense: 22, weight: 8, areaLevelReq: 6 },
  { id: 'chain_mail', name: 'Chain Mail', type: 'armor', defense: 18, weight: 22, areaLevelReq: 10 },

  // Level 9+ (Hole / Jail)
  { id: 'two_handed_sword', name: 'Two-Handed Sword', type: 'weapon', damage: { min: 4, max: 13 }, weight: 8, areaLevelReq: 9 },
  { id: 'axe', name: 'Axe', type: 'weapon', damage: { min: 5, max: 12 }, weight: 7, areaLevelReq: 9 },
  { id: 'double_axe', name: 'Double Axe', type: 'weapon', damage: { min: 5, max: 11 }, weight: 9, areaLevelReq: 10 },
  { id: 'large_shield', name: 'Large Shield', type: 'shield', defense: 18, weight: 14, areaLevelReq: 10 },
  { id: 'plate_mail', name: 'Plate Mail', type: 'armor', defense: 26, weight: 30, areaLevelReq: 12 },
  { id: 'ring_mail', name: 'Ring Mail', type: 'armor', defense: 35, weight: 28, areaLevelReq: 15 },
  { id: 'tower_shield', name: 'Tower Shield', type: 'shield', defense: 26, weight: 18, areaLevelReq: 12 },
];

// ───── D2 Rune Data ─────
const RUNE_DATA: { name: string; tier: number }[] = [
  { name: 'El', tier: 1 }, { name: 'Eld', tier: 2 }, { name: 'Tir', tier: 3 },
  { name: 'Nef', tier: 4 }, { name: 'Eth', tier: 5 }, { name: 'Ith', tier: 6 },
  { name: 'Tal', tier: 7 }, { name: 'Ral', tier: 8 }, { name: 'Ort', tier: 9 },
  { name: 'Thul', tier: 10 }, { name: 'Amn', tier: 11 }, { name: 'Sol', tier: 12 },
  { name: 'Shael', tier: 13 }, { name: 'Dol', tier: 14 }, { name: 'Hel', tier: 15 },
  { name: 'Io', tier: 16 }, { name: 'Lum', tier: 17 }, { name: 'Ko', tier: 18 },
  { name: 'Fal', tier: 19 }, { name: 'Lem', tier: 20 }, { name: 'Pul', tier: 21 },
  { name: 'Um', tier: 22 }, { name: 'Mal', tier: 23 }, { name: 'Ist', tier: 24 },
  { name: 'Gul', tier: 25 }, { name: 'Vex', tier: 26 }, { name: 'Ohm', tier: 27 },
  { name: 'Lo', tier: 28 }, { name: 'Sur', tier: 29 }, { name: 'Ber', tier: 30 },
  { name: 'Jah', tier: 31 }, { name: 'Cham', tier: 32 }, { name: 'Zod', tier: 33 },
];

// ───── Core Drop Function ─────
export function generateDrop(areaLevel: number, zone?: Zone): DropResult[] {
  const multiplier = zone?.bossDropMultiplier ?? 1.0;
  const baseRolls = 1 + Math.floor(multiplier * 0.5);
  const extraRolls = multiplier > 2 ? Math.floor(rngFloat(multiplier)) : 0;
  const totalRolls = baseRolls + extraRolls;

  const drops: DropResult[] = [];

  for (let i = 0; i < totalRolls; i++) {
    const noDropChance = Math.max(0.2, 0.7 - (areaLevel * 0.028));
    if (rngFloat(1) < noDropChance) continue;

    const runeChance = zone?.zoneType === 'boss_tower' ? 0.12 : 0.05;
    if (rngFloat(1) < runeChance) {
      const maxRuneTier = Math.min(33, Math.floor(areaLevel / 2) + 1 + Math.floor(multiplier));
      const eligibleRunes = RUNE_DATA.filter(r => r.tier <= maxRuneTier);
      if (eligibleRunes.length > 0) {
        const idx = rngInt(0, eligibleRunes.length - 1);
        drops.push({ type: 'rune', ...eligibleRunes[idx] });
        continue;
      }
    }

    const eligible = ITEM_POOL.filter(item => item.areaLevelReq <= areaLevel);
    if (eligible.length === 0) continue;

    const totalWeight = eligible.reduce((sum, item) => sum + item.weight, 0);
    let roll = rngFloat(totalWeight);
    let selectedItem: ItemPoolEntry | null = null;

    for (const item of eligible) {
      roll -= item.weight;
      if (roll <= 0) { selectedItem = item; break; }
    }
    if (!selectedItem) selectedItem = eligible[0];

    // D2R quality roll: 'normal' items can roll superior as a boolean flag
    const qualityThresholdLow = 0.25 - (multiplier * 0.03);
    const qualityThresholdHigh = 0.15 + (multiplier * 0.05);
    const qualityRoll = rngFloat(1);
    let quality: InventoryItem['quality'] = 'normal';
    if (multiplier >= 3 && qualityRoll < 0.30) quality = 'rare';
    else if (multiplier >= 2 && qualityRoll < 0.45) quality = 'magic';
    else if (qualityRoll < qualityThresholdLow) quality = 'low';

    // 10% superior roll — only for 'normal' quality items
    let isSuperior = false;
    if (quality === 'normal' && rngFloat(1) < 0.10) {
      isSuperior = true;
    }

    const sockets = multiplier >= 2 ? rngInt(1, 3) : (rngFloat(1) < 0.3 ? rngInt(1, 2) : 0);

    // Build final item, applying superior damage/defense bonus
    let damage = selectedItem.damage ? { ...selectedItem.damage } : undefined;
    let defense = selectedItem.defense;

    if (isSuperior) {
      const bonus = 0.05 + rngFloat(0.11); // 5-15%
      if (damage) {
        damage.min = Math.round(damage.min * (1 + bonus));
        damage.max = Math.round(damage.max * (1 + bonus));
      }
      if (defense !== undefined) {
        defense = Math.round(defense * (1 + bonus));
      }
    }

    drops.push({
      ...selectedItem,
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
  // 1. Validate item exists and has runeSockets > 0
  // 2. Validate rune exists in inventory
  // 3. Apply rune modifier (use RUNE_DATA for stats)
  // 4. Check for runeword combo (e.g., Tal + Eth = Stealth)
  // 5. Transform item to runeword if combo matches
  const rune = RUNE_DATA.find(r => r.name.toLowerCase() === runeId.toLowerCase());
  if (!rune) return { success: false, message: `Rune "${runeId}" not found` };
  return {
    success: false,
    message: `[TODO] ${rune.name} socketed into ${itemId}. Runeword logic pending.`,
  };
}
