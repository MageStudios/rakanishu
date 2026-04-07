/* @refresh reload */
export type AffixType = 'PREFIX' | 'SUFFIX';

export interface MagicAffix {
  id: string;
  name: string;
  type: AffixType;
  stat: string;
  value: [number, number][];
  levelReq: number[];
}

// ─── Prefixes ─────────────────────────────────────────────────────

export const STURDY: MagicAffix = {
  id: 'sturdy', name: "Sturdy", type: 'PREFIX', stat: 'defense%',
  value: [[10, 20], [20, 30], [30, 40]], levelReq: [1, 5, 10],
};
export const SHARP: MagicAffix = {
  id: 'sharp', name: "Sharp", type: 'PREFIX', stat: 'weaponDmg',
  value: [[1, 3], [2, 5], [3, 7]], levelReq: [1, 5, 10],
};
export const LIZARDS: MagicAffix = {
  id: 'lizards', name: "Lizard's", type: 'PREFIX', stat: 'mana',
  value: [[5, 10], [10, 20], [20, 30]], levelReq: [1, 5, 10],
};
export const BERYL: MagicAffix = {
  id: 'beryl', name: "Beryl", type: 'PREFIX', stat: 'dexterity',
  value: [[1, 2], [2, 4], [4, 6]], levelReq: [1, 5, 10],
};

// ─── Suffixes ─────────────────────────────────────────────────────

export const OF_STRENGTH: MagicAffix = {
  id: 'of_strength', name: "of Strength", type: 'SUFFIX', stat: 'strength',
  value: [[1, 3], [3, 6], [6, 10]], levelReq: [1, 5, 10],
};
export const OF_THE_FOX: MagicAffix = {
  id: 'of_the_fox', name: "of the Fox", type: 'SUFFIX', stat: 'dexterity',
  value: [[1, 3], [3, 6], [6, 10]], levelReq: [1, 5, 10],
};
export const OF_THE_WHALE: MagicAffix = {
  id: 'of_the_whale', name: "of the Whale", type: 'SUFFIX', stat: 'hp',
  value: [[5, 10], [10, 20], [20, 30]], levelReq: [1, 5, 10],
};
export const OF_ALACRITY: MagicAffix = {
  id: 'of_alacrity', name: "of Alacrity", type: 'SUFFIX', stat: 'ias',
  value: [[10, 15], [15, 20], [20, 30]], levelReq: [1, 8, 15],
};

export const ALL_AFFIXES: MagicAffix[] = [
  STURDY, SHARP, LIZARDS, BERYL, OF_STRENGTH, OF_THE_FOX, OF_THE_WHALE, OF_ALACRITY,
];
