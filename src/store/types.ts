// ============================================================================
// TYPE DEFINITIONS - Shared across store and context
// ============================================================================

export type EnemyType = "Slime" | "Rat" | "Goblin" | "Wolf" | "Skeleton" | "Orc" | "Dragon";

export interface Enemy {
  id: number;
  name: string;
  maxHp: number;
  currentHp: number;
  level: number;
  damage: number;
  xpReward: number;
  goldReward: number;
  type: EnemyType;
}

export interface Hireling {
  id: string;
  name?: string;
  type: "fighter" | "merchant" | "none";
}

export interface Assistant {
  id: string;
  name: string;
  type: "auto-seller" | "potion-giver";
  active: boolean;
  color: string;
  settings?: {
    goldPerInterval: number;
    intervalSeconds: number;
    potionAmount: number;
  };
}

export interface Item {
  id: string;
  name: string;
  type: "weapon" | "armor" | "consumable";
  value: number; // In gold
  damage?: number;
}

export interface Player {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  gold: number;
  xp: number;
  maxXp: number;
  hirelings: Hireling[];
  assistants: Assistant[];
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  inventory: Record<string, number>; // itemId -> quantity
  assistants: Assistant[];
  combatLog: {
    timestamp: string; // ISO date
    type: "damage" | "heal" | "gold" | "xp";
    message: string;
  }[];
}

export const TOTAL_WAVES = 50;
