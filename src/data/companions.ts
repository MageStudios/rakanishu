// src/data/companions.ts
// Companion Mercenaries: Shakira (Amazon) + Kyra (Cold Arrow Rogue)

export interface CompanionAbility {
  name: string;
  type: 'attack' | 'skill';
  damage?: { min: number; max: number };
  element?: 'physical' | 'cold' | 'fire' | 'lightning' | 'poison';
  description: string;
  cooldown?: number; // in player ticks, if applicable
}

export interface Companion {
  id: string;
  name: string;
  class: string;
  description: string;
  baseStats: {
    hp: number;
    maxHp: number;
    strength: number;
    agility: number;
    intellect: number;
    defense: number;
    speed: number;
  };
  inventoryGrid: { cols: number; rows: number };
  abilities: CompanionAbility[];
  unlockCondition?: { flag: string }; // e.g., BLOOD_RAVEN_DEFEATED
  attackInterval?: number; // in player ticks, e.g., 2 means fires every 2nd player tick
}

// Shakira — Amazon
export const SHAKIRA: Companion = {
  id: 'shakira',
  name: 'Shakira',
  class: 'Amazon',
  description: 'A spear-wielding warrior of the Sisterhood.',
  baseStats: {
    hp: 120,
    maxHp: 120,
    strength: 8,
    agility: 6,
    intellect: 3,
    defense: 4,
    speed: 3,
  },
  inventoryGrid: { cols: 10, rows: 4 },
  abilities: [
    {
      name: 'Jab',
      type: 'attack',
      damage: { min: 5, max: 10 },
      element: 'physical',
      description: 'A swift spear thrust.',
    },
  ],
};

// Kyra — Cold Arrow Rogue (unlocks after Blood Raven defeated)
export const KYRA: Companion = {
  id: 'kyra',
  name: 'Kyra',
  class: 'Rogue Scout',
  description: 'A rogue archer wielding frost-tipped arrows.',
  baseStats: {
    hp: 80,
    maxHp: 80,
    strength: 4,
    agility: 10,
    intellect: 5,
    defense: 2,
    speed: 4,
  },
  inventoryGrid: { cols: 10, rows: 4 },
  abilities: [
    {
      name: 'Cold Arrow',
      type: 'skill',
      damage: { min: 4, max: 8 },
      element: 'cold',
      description: 'Fires a frost arrow, dealing cold damage.',
    },
  ],
  unlockCondition: { flag: 'BLOOD_RAVEN_DEFEATED' },
  attackInterval: 2, // fires every 2nd player tick
};

export const ALL_COMPANIONS: Companion[] = [SHAKIRA, KYRA];

export function getCompanionById(id: string): Companion | undefined {
  return ALL_COMPANIONS.find(c => c.id === id);
}
