// src/data/treasureClasses.ts
// Diablo 2-style Treasure Classes: weighted pool, drop chance, and quality rolls.

export interface TCItem {
  id: string;
  name: string;
  weight: number;
  quality: 'normal' | 'magic' | 'rare' | 'unique';
  defense?: number;
  damage?: { min: number; max: number };
  type: 'weapon' | 'armor' | 'shield' | 'helm';
  areaLevelReq: number;
}

export interface TreasureClass {
  name: string;
  tcLevel: number;     // 1-6 scaling
  noDropChance: number; // 0.0-1.0
  runeChance: number;   // 0.0-1.0
  uniqueChance: number; // 0.0-1.0 (overrides normal → unique if rolled)
  items: TCItem[];
  runeMaxTier: number;   // Highest eligible rune tier
}

// ── TC3: Fallen (early-game fodder, ~alvl 1-3) ──
const TC3: TreasureClass = {
  name: 'Fallen_Logs',
  tcLevel: 3,
  noDropChance: 0.62,
  runeChance: 0.04,
  uniqueChance: 0.01,
  runeMaxTier: 3,
  items: [
    { id: 'short_sword',   name: 'Short Sword',  weight: 3, quality: 'normal', damage: { min: 4, max: 6 },  type: 'weapon',  areaLevelReq: 1 },
    { id: 'hatchet',       name: 'Hatchet',      weight: 3, quality: 'normal', damage: { min: 3, max: 8 },  type: 'weapon',  areaLevelReq: 1 },
    { id: 'cap',           name: 'Cap',          weight: 2, quality: 'normal', defense: 2,                   type: 'helm',    areaLevelReq: 1 },
    { id: 'buckler',       name: 'Buckler',      weight: 5, quality: 'normal', defense: 5,                   type: 'shield',  areaLevelReq: 1 },
    { id: 'short_bow',     name: 'Short Bow',    weight: 2, quality: 'normal', damage: { min: 3, max: 6 },  type: 'weapon',  areaLevelReq: 3 },
    { id: 'leather_armor', name: 'Leather Armor',weight: 6, quality: 'normal', defense: 5,                   type: 'armor',   areaLevelReq: 3 },
    { id: 'skull_cap',     name: 'Skull Cap',    weight: 2, quality: 'normal', defense: 5,                   type: 'helm',    areaLevelReq: 3 },
  ],
};

// ── TC6: Corpsefire (boss chest, ~alvl 5-8, higher unique chance) ──
const TC6: TreasureClass = {
  name: 'Corpsefire_Logs',
  tcLevel: 6,
  noDropChance: 0.35,
  runeChance: 0.10,
  uniqueChance: 0.08,
  runeMaxTier: 9,
  items: [
    { id: 'long_sword',    name: 'Long Sword',     weight: 4, quality: 'normal', damage: { min: 3, max: 10 }, type: 'weapon', areaLevelReq: 4 },
    { id: 'hand_axe',      name: 'Hand Axe',       weight: 4, quality: 'normal', damage: { min: 3, max: 7 },  type: 'weapon', areaLevelReq: 4 },
    { id: 'shield',        name: 'Shield',         weight: 7, quality: 'normal', defense: 10,                  type: 'shield', areaLevelReq: 4 },
    { id: 'broad_sword',   name: 'Broad Sword',    weight: 5, quality: 'normal', damage: { min: 6, max: 9 },  type: 'weapon', areaLevelReq: 5 },
    { id: 'heavy_armor',   name: 'Heavy Armor',    weight: 14,quality: 'normal', defense: 12,                  type: 'armor',  areaLevelReq: 5 },
    { id: 'helm',          name: 'Helm',           weight: 3, quality: 'normal', defense: 7,                   type: 'helm',   areaLevelReq: 5 },
    { id: 'hunters_bow',   name: "Hunter's Bow",   weight: 2, quality: 'normal', damage: { min: 4, max: 8 },  type: 'weapon', areaLevelReq: 6 },
    { id: 'long_bow',      name: 'Long Bow',       weight: 4, quality: 'normal', damage: { min: 3, max: 10 }, type: 'weapon', areaLevelReq: 6 },
    { id: 'kite_shield',   name: 'Kite Shield',    weight: 8, quality: 'normal', defense: 22,                  type: 'shield', areaLevelReq: 6 },
  ],
};

const TREASURE_CLASSES: Record<number, TreasureClass> = {
  3: TC3,
  6: TC6,
};

export const RUNE_NAMES = [
  'El','Eld','Tir','Nef','Eth','Ith','Tal','Ral','Ort','Thul',
  'Amn','Sol','Shael','Dol','Hel','Io','Lum','Ko','Fal','Lem',
  'Pul','Um','Mal','Ist','Gul','Vex','Ohm','Lo','Sur','Ber',
  'Jah','Cham','Zod',
];

export function getTC(tcLevel: number): TreasureClass | null {
  return TREASURE_CLASSES[tcLevel] ?? null;
}

/** Roll a single item from a TC pool. Returns null on no-drop. */
export function rollTCItem(tcLevel: number): { item: TCItem; quality: 'normal'|'magic'|'rare'|'unique'; rune?: string } | null {
  const tc = TREASURE_CLASSES[tcLevel];
  if (!tc) return null;

  // No-drop check
  if (rngFloat() < tc.noDropChance) return null;

  // Rune check (override item)
  if (rngFloat() < tc.runeChance) {
    const maxTier = Math.min(33, tc.runeMaxTier);
    return { item: tc.items[0], quality: 'normal', rune: RUNE_NAMES[Math.floor(rngFloat() * maxTier)] };
  }

  // Weighted item selection
  const totalW = tc.items.reduce((s, i) => s + i.weight, 0);
  let roll = rngFloat() * totalW;
  let picked: TCItem = tc.items[0];
  for (const it of tc.items) {
    roll -= it.weight;
    if (roll <= 0) { picked = it; break; }
  }

  // Quality override → unique
  let quality: 'normal'|'magic'|'rare'|'unique' = picked.quality;
  if (picked.quality === 'normal' && rngFloat() < tc.uniqueChance) {
    quality = 'unique';
  }

  return { item: picked, quality };
}

// ── Embedded Xoshiro256++ PRNG (same seed as combat) ──
let _s0 = 1, _s1 = 2, _s2 = 3, _s3 = 4;
function rngFloat(): number {
  const s3 = _s3;
  const result = (_s0 + _s3) >>> 0;
  const t = (_s1 << 17) >>> 0;
  _s2 ^= _s0; _s3 ^= _s1; _s1 ^= _s2; _s0 ^= _s3;
  _s2 ^= t;  _s3 = (_s3 << 7) >>> 0;
  _s3 ^= _s2; _s3 = (_s3 << 45) >>> 0;
  return (result / 4294967296);
}
