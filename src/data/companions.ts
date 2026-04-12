// src/data/companions.ts
import { ASHEARA, QUAL_KEHK, FARA, ORMUS, ALKOR, NATALYA, FLAVIE } from './classes';

export interface CompanionAbility {
  name: string;
  type: 'attack' | 'skill';
  damage?: { min: number; max: number };
  element?: 'physical' | 'cold' | 'fire' | 'lightning' | 'poison' | 'magic';
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

export const ALL_COMPANIONS: Companion[] = [
  ASHEARA, QUAL_KEHK, FARA, ORMUS, ALKOR, NATALYA, FLAVIE
];

export function getCompanionById(id: string): Companion | undefined {
  return ALL_COMPANIONS.find(c => c.id === id);
}

