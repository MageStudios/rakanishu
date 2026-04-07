// @ts-check
/* @refresh reload */
export type ItemType = 'WEAPON' | 'ARMOR' | 'JEWELRY';
export type ArmorSlot = 'HEAD' | 'CHEST' | 'SHIELD' | 'HANDS' | 'FEET' | 'BELT';
export type WeaponSlot = 'ONE_HAND' | 'TWO_HAND';

export type BaseItem = {
  id: string;
  name: string;
  type: ItemType;
  slot: ArmorSlot | WeaponSlot | 'RING' | 'AMULET';
  requirements: { level: number; str?: number; dex?: number };
  damage?: [number, number][];
  speed?: number[];
  defense?: [number, number][];
  durability?: number[];
};

// -- Weapons --
export const SHORT_SWORD: BaseItem = {
  id: 'SHORT_SWORD', name: 'Short Sword', type: 'WEAPON', slot: 'ONE_HAND',
  requirements: { level: 1 },
  damage: [[1, 4], [3, 9], [5, 14]], speed: [2, 3, 4],
};
export const HAND_AXE: BaseItem = {
  id: 'HAND_AXE', name: 'Hand Axe', type: 'WEAPON', slot: 'ONE_HAND',
  requirements: { level: 1 },
  damage: [[2, 5], [4, 10], [6, 15]], speed: [1, 2, 3],
};
export const SHORT_BOW: BaseItem = {
  id: 'SHORT_BOW', name: 'Short Bow', type: 'WEAPON', slot: 'TWO_HAND',
  requirements: { level: 1, dex: 5 },
  damage: [[1, 3], [2, 6], [4, 9]], speed: [3, 4, 5],
};
// -- Armor --
export const QUILTED_ARMOR: BaseItem = {
  id: 'QUILTED_ARMOR', name: 'Quilted Armor', type: 'ARMOR', slot: 'CHEST',
  requirements: { level: 1 },
  defense: [[3, 5], [6, 10], [9, 15]], durability: [12, 16, 20],
};
export const LEATHER_ARMOR: BaseItem = {
  id: 'LEATHER_ARMOR', name: 'Leather Armor', type: 'ARMOR', slot: 'CHEST',
  requirements: { level: 1 },
  defense: [[5, 7], [8, 12], [11, 18]], durability: [15, 20, 25],
};
export const BUCKLER: BaseItem = {
  id: 'BUCKLER', name: 'Buckler', type: 'ARMOR', slot: 'SHIELD',
  requirements: { level: 1 },
  defense: [[2, 4], [4, 8], [6, 12]], durability: [10, 14, 18],
};
// -- Jewelry (stat-less bases) --
export const RING: BaseItem = {
  id: 'RING', name: 'Ring', type: 'JEWELRY', slot: 'RING',
  requirements: { level: 0 },
};
export const AMULET: BaseItem = {
  id: 'AMULET', name: 'Amulet', type: 'JEWELRY', slot: 'AMULET',
  requirements: { level: 0 },
};
export const ACT1_BASES: BaseItem[] = [
  SHORT_SWORD, HAND_AXE, SHORT_BOW,
  QUILTED_ARMOR, LEATHER_ARMOR, BUCKLER,
  RING, AMULET,
];

export type ItemBaseEntry = BaseItem;
export function getAllBases(): BaseItem[] { return ACT1_BASES; }
