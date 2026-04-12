// src/logic/combatTypes.ts
// Shared type definitions — zero dependencies

export type CombatPhase = 'IDLE' | 'INCOMING' | 'ENGAGED' | 'RESOLVING' | 'FINISHED';

export interface CombatLogEntry {
  tick: number;
  source: string;
  target: string;
  value: number;
  type: 'PHYSICAL' | 'MAGIC' | 'loot' | 'system';
  isCrit: boolean;
  message: string;
}

/** Minimal combatant shape used by the engine */
export interface CombatantDef {
  name: string;
  hp: number;
  maxHp: number;
  strength: number;
  agility: number;
  intellect: number;
  defense: number;
  speed: number;
  type: 'PHYSICAL' | 'MAGIC' | 'UNDEAD' | 'DEMON' | 'BEAST' | 'BOSS' | 'UBER';
}

/** One entry in the turn-order queue */
export interface TurnEntry {
  combatant: string; // 'player' | 'enemy' | NPC id
  priority: number;   // derived from speed
  accumulator: number; // fills each tick; >= 1.0 → acts
}
