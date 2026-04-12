// src/data/classes.ts
// The 7 Main D2 Classes defined via Notable NPC proxies
// MAGE STUDIOS LAW: No destructuring logic here, pure state definitions.

import type { Companion } from './companions';

export const ASHEARA: Companion = {
  id: 'asheara',
  name: 'Asheara',
  class: 'Sorceress',
  description: 'Leader of the Iron Wolves. A powerful elemental mage.',
  baseStats: { hp: 70, maxHp: 70, strength: 3, agility: 4, intellect: 12, defense: 2, speed: 5 },
  inventoryGrid: { cols: 10, rows: 4 },
  abilities: [
    {
      name: 'Fireball',
      type: 'skill',
      damage: { min: 8, max: 15 },
      element: 'fire',
      description: 'Hurls a sphere of fire at the enemy.',
    },
  ],
};

export const QUAL_KEHK: Companion = {
  id: 'qual_kehk',
  name: 'Qual-Kehk',
  class: 'Barbarian',
  description: 'Captain of the mercenary forces in Harrogath. A wall of muscle.',
  baseStats: { hp: 150, maxHp: 150, strength: 12, agility: 5, intellect: 2, defense: 6, speed: 3 },
  inventoryGrid: { cols: 10, rows: 4 },
  abilities: [
    {
      name: 'Bash',
      type: 'attack',
      damage: { min: 8, max: 14 },
      element: 'physical',
      description: 'A crushing weapon attack that knocks enemies back.',
    },
  ],
};

export const FARA: Companion = {
  id: 'fara',
  name: 'Fara',
  class: 'Paladin',
  description: 'Former Paladin of Zakarum, now a blacksmith and healer.',
  baseStats: { hp: 110, maxHp: 110, strength: 8, agility: 6, intellect: 6, defense: 8, speed: 4 },
  inventoryGrid: { cols: 10, rows: 4 },
  abilities: [
    {
      name: 'Holy Bolt',
      type: 'skill',
      damage: { min: 5, max: 10 },
      element: 'magic', // Damages undead, but for now acts as standard attack in engine
      description: 'Fires a bolt of holy light.',
    },
  ],
};

export const ORMUS: Companion = {
  id: 'ormus',
  name: 'Ormus',
  class: 'Druid',
  description: 'An eccentric mage and poet offering elemental blessings.',
  baseStats: { hp: 100, maxHp: 100, strength: 6, agility: 6, intellect: 9, defense: 4, speed: 4 },
  inventoryGrid: { cols: 10, rows: 4 },
  abilities: [
    {
      name: 'Oak Sage',
      type: 'skill',
      element: 'magic',
      description: 'Passively grants HP buffs to the party (implemented in stats engine).',
      // We will model the buff at the store level, Ormus still takes turns to tick buffs
    },
    {
      name: 'Tornado',
      type: 'skill',
      damage: { min: 6, max: 12 },
      element: 'physical',
      description: 'Sends out a chaotic vortex of wind.',
    }
  ],
  attackInterval: 2,
};

export const ALKOR: Companion = {
  id: 'alkor',
  name: 'Alkor',
  class: 'Necromancer',
  description: 'An alchemist with a dangerous obsession with the dark arts.',
  baseStats: { hp: 80, maxHp: 80, strength: 3, agility: 5, intellect: 11, defense: 3, speed: 4 },
  inventoryGrid: { cols: 10, rows: 4 },
  abilities: [
    {
      name: 'Poison Nova',
      type: 'skill',
      damage: { min: 3, max: 18 },
      element: 'poison',
      description: 'Emits a ring of deadly poison.',
    },
  ],
};

export const NATALYA: Companion = {
  id: 'natalya',
  name: 'Natalya',
  class: 'Assassin',
  description: 'A mysterious shadow from the Viz-Jaqtaar order.',
  baseStats: { hp: 90, maxHp: 90, strength: 5, agility: 12, intellect: 5, defense: 4, speed: 6 },
  inventoryGrid: { cols: 10, rows: 4 },
  abilities: [
    {
      name: 'Lightning Sentry',
      type: 'skill',
      damage: { min: 1, max: 20 },
      element: 'lightning',
      description: 'Fires a charged bolt at the target.',
    },
  ],
};

export const FLAVIE: Companion = {
  id: 'flavie',
  name: 'Flavie',
  class: 'Amazon',
  description: 'A rogue guarding the wilds of Khanduras.',
  baseStats: { hp: 100, maxHp: 100, strength: 6, agility: 10, intellect: 4, defense: 4, speed: 5 },
  inventoryGrid: { cols: 10, rows: 4 },
  abilities: [
    {
      name: 'Multiple Shot',
      type: 'skill',
      damage: { min: 4, max: 9 },
      element: 'physical',
      description: 'Fires a spread of arrows.',
    },
  ],
};
