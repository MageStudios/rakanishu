/**
 * Item Base Definitions — D2LoD Authentic Dimensions
 * Every base type has width/height for spatial grid placement.
 * PRNG roll determines base type → determines dimensions → then rolls stats.
 */

export interface ItemBaseEntry {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'helm' | 'shield' | 'ring' | 'amulet' | 'charm';
  slot: EquipmentSlot; // which paper-doll slot it equips to
  w: number;  // grid width (cells)
  h: number;  // grid height (cells)
  damage?: { min: number; max: number };
  defense?: number;
}

export type EquipmentSlot =
  | 'head'      // 2×2 helm
  | 'torso'     // 2×3 body armor
  | 'leftHand'  // 2×4 weapon
  | 'rightHand' // 2×3 shield / 2×4 two-hand
  | 'gloves'    // 2×2
  | 'belt'      // 1×2
  | 'boots'     // 2×2
  | 'ring1'     // 1×1
  | 'ring2'     // 1×1
  | 'amulet';   // 1×1

const SLOTS: Record<string, { w: number; h: number; accepts: string[] }> = {
  head:      { w: 2, h: 2, accepts: ['helm'] },
  torso:     { w: 2, h: 3, accepts: ['armor'] },
  leftHand:  { w: 2, h: 4, accepts: ['weapon'] },
  rightHand: { w: 2, h: 3, accepts: ['shield'] },
  gloves:    { w: 2, h: 2, accepts: ['gloves'] },
  belt:      { w: 1, h: 2, accepts: ['belt'] },
  boots:     { w: 2, h: 2, accepts: ['boots'] },
  ring1:     { w: 1, h: 1, accepts: ['ring'] },
  ring2:     { w: 1, h: 1, accepts: ['ring'] },
  amulet:    { w: 1, h: 1, accepts: ['amulet'] },
};

// ─── Weapon Bases ───
export const weaponBases: ItemBaseEntry[] = [
  // Swords
  { id: 'short_sword',    name: 'Short Sword',        type: 'weapon', slot: 'leftHand',  w: 1, h: 3, damage: { min: 4, max: 6 } },
  { id: 'long_sword',     name: 'Long Sword',         type: 'weapon', slot: 'leftHand',  w: 1, h: 3, damage: { min: 3, max: 10 } },
  { id: 'broad_sword',    name: 'Broad Sword',        type: 'weapon', slot: 'leftHand',  w: 1, h: 3, damage: { min: 6, max: 9 } },
  { id: 'crystal_sword',  name: 'Crystal Sword',      type: 'weapon', slot: 'leftHand',  w: 2, h: 4, damage: { min: 5, max: 11 } },
  { id: 'two_handed_sword', name: 'Two-Handed Sword', type: 'weapon', slot: 'leftHand',  w: 2, h: 4, damage: { min: 4, max: 13 } },

  // Axes
  { id: 'hatchet',   name: 'Hatchet',    type: 'weapon', slot: 'leftHand', w: 1, h: 3, damage: { min: 3, max: 8 } },
  { id: 'hand_axe',  name: 'Hand Axe',   type: 'weapon', slot: 'leftHand', w: 1, h: 3, damage: { min: 3, max: 7 } },
  { id: 'axe',       name: 'Axe',        type: 'weapon', slot: 'leftHand', w: 1, h: 3, damage: { min: 5, max: 12 } },
  { id: 'double_axe', name: 'Double Axe', type: 'weapon', slot: 'leftHand', w: 2, h: 4, damage: { min: 5, max: 11 } },

  // Bows
  { id: 'short_bow',     name: "Short Bow",      type: 'weapon', slot: 'leftHand', w: 1, h: 3, damage: { min: 3, max: 6 } },
  { id: 'hunters_bow',   name: "Hunter's Bow",   type: 'weapon', slot: 'leftHand', w: 1, h: 3, damage: { min: 4, max: 8 } },
  { id: 'long_bow',      name: 'Long Bow',       type: 'weapon', slot: 'leftHand', w: 1, h: 4, damage: { min: 3, max: 10 } },
];

// ─── Armor Bases ───
export const armorBases: ItemBaseEntry[] = [
  { id: 'leather_armor', name: 'Leather Armor', type: 'armor', slot: 'torso', w: 2, h: 3, defense: 5 },
  { id: 'heavy_armor',   name: 'Heavy Armor',   type: 'armor', slot: 'torso', w: 2, h: 3, defense: 12 },
  { id: 'chain_mail',    name: 'Chain Mail',    type: 'armor', slot: 'torso', w: 2, h: 3, defense: 18 },
  { id: 'plate_mail',    name: 'Plate Mail',    type: 'armor', slot: 'torso', w: 2, h: 4, defense: 26 },
  { id: 'ring_mail',     name: 'Ring Mail',     type: 'armor', slot: 'torso', w: 2, h: 3, defense: 35 },
];

// ─── Shield Bases ───
export const shieldBases: ItemBaseEntry[] = [
  { id: 'buckler',      name: 'Buckler',      type: 'shield', slot: 'rightHand', w: 2, h: 2, defense: 5 },
  { id: 'small_shield', name: 'Small Shield', type: 'shield', slot: 'rightHand', w: 2, h: 2, defense: 8 },
  { id: 'kite_shield',  name: 'Kite Shield',  type: 'shield', slot: 'rightHand', w: 2, h: 3, defense: 22 },
  { id: 'large_shield', name: 'Large Shield', type: 'shield', slot: 'rightHand', w: 2, h: 3, defense: 18 },
  { id: 'tower_shield', name: 'Tower Shield', type: 'shield', slot: 'rightHand', w: 2, h: 3, defense: 26 },
];

// ─── Helm Bases ───
export const helmBases: ItemBaseEntry[] = [
  { id: 'cap',       name: 'Cap',       type: 'helm', slot: 'head', w: 2, h: 2, defense: 2 },
  { id: 'skull_cap', name: 'Skull Cap', type: 'helm', slot: 'head', w: 2, h: 2, defense: 5 },
  { id: 'helm',      name: 'Helm',      type: 'helm', slot: 'head', w: 2, h: 3, defense: 7 },
  { id: 'full_helm', name: 'Full Helm', type: 'helm', slot: 'head', w: 2, h: 3, defense: 10 },
];

// ─── Ring ───
export const ringBase: ItemBaseEntry = {
  id: 'ring', name: 'Ring', type: 'ring', slot: 'ring1', w: 1, h: 1, defense: 0,
};

// ─── Amulet ───
export const amuletBase: ItemBaseEntry = {
  id: 'amulet', name: 'Amulet', type: 'amulet', slot: 'amulet', w: 1, h: 1,
};

// ─── Charm Bases (D2 authentic sizes) ───
export const charmBases: ItemBaseEntry[] = [
  { id: 'small_charm', name: 'Small Charm', type: 'charm', slot: 'head', w: 1, h: 2 },
  { id: 'large_charm', name: 'Large Charm', type: 'charm', slot: 'head', w: 1, h: 2 },
  { id: 'grand_charm', name: 'Grand Charm', type: 'charm', slot: 'head', w: 1, h: 3 },
];

// ─── Lookup ───
const ALL_BASES = [
  ...weaponBases,
  ...armorBases,
  ...shieldBases,
  ...helmBases,
  ringBase,
  amuletBase,
  ...charmBases,
];

export function getBaseById(id: string): ItemBaseEntry | undefined {
  return ALL_BASES.find(b => b.id === id);
}

export function getAllBases(): ItemBaseEntry[] {
  return [...ALL_BASES];
}

export { SLOTS };
