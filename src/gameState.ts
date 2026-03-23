// ============================================================================
// ⚠️  SINGLE SOURCE OF TRUTH - READ THIS FIRST  ⚠️
// ============================================================================
//
// This file is the SINGLE SOURCE OF TRUTH for ALL game data.
//
// RULES:
// 1. ALL game state lives here (player, enemies, loot, inventory, combat log)
// 2. ALL components read from `gameState` directly (no local copies)
// 3. ALL mutations use `setGameState()` or helper functions
// 4. DO NOT create duplicate state in components or other files
// 5. DO NOT use Context providers for game state (use direct imports)
//
// ARCHITECTURE:
// - gameState = Persistent game data (saves to localStorage)
// - combatState = Temporary combat data (resets each wave)
//
// USAGE:
//   import { gameState, setGameState, addLootDrop } from './gameState';
//   
//   // Read (reactive):
//   <p>Gold: {gameState.player.gold}</p>
//   
//   // Write:
//   setGameState("player", "gold", (g) => g + 50);
//   addLootDrop(item, 50);
//
// ============================================================================

import { createStore, reconcile } from "solid-js/store";

// ============================================================================
// TYPES & CONFIGURATION
// ============================================================================

export interface Enemy {
  id: number;
  name: string;
  maxHp: number;
  currentHp: number;
  level: number;
  damage: number;
  xpReward: number;
  goldReward: number;
  type: "Slime" | "Rat" | "Goblin" | "Wolf" | "Skeleton" | "Orc" | "Dragon";
  respawnTimer?: number; // in ticks (0 = ready to spawn)
}

export type EnemyType = "Slime" | "Rat" | "Goblin" | "Wolf" | "Skeleton" | "Orc" | "Dragon";

export interface Item {
  id: string;
  name: string;
  type: "weapon" | "armor" | "consumable";
  rarity: "common" | "magic" | "rare" | "unique";
  value: number;
  damage?: number;
  armor?: number;
}

export interface LootDrop {
  id: string;
  timestamp: Date;
  item: Item;
  goldValue: number;
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

export interface Player {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  gold: number;
  xp: number;
  nextLevelXp: number;
  damage: number;
  // Progression
  enemiesDefeated: number;
  wavesCompleted: number;
  totalKills: number;
  // Hirelings and Assistants
  hirelings: Hireling[];
  assistants: Assistant[];
}

export interface GameState {
  // Meta
  isPlaying: boolean;
  isGameOver: boolean;
  gameState: "START" | "PLAYING" | "WON" | "LOST";
  saveVersion: number; // For future migrations
  
  // Player
  player: Player;
  
  // Combat
  currentEnemyIndex: number; // -1 means no enemy active
  enemies: Enemy[];
  totalWaves: number;
  
  // Loot
  lootDrops: LootDrop[];
  inventory: Record<string, number>; // itemId -> quantity
  
  // Combat Log
  combatLog: {
    timestamp: string; // ISO date
    type: "damage" | "heal" | "gold" | "xp" | "loot";
    message: string;
  }[];
}

export const TOTAL_WAVES = 50;
export const TICK_RATE_MS = 100; // Fixed timestep

// ============================================================================
// DEFAULT VALUES & ENEMY DATABASE
// ============================================================================

const defaultPlayer: Player = {
  name: "Warrior",
  level: 1,
  hp: 100,
  maxHp: 100,
  gold: 0,
  xp: 0,
  nextLevelXp: 100,
  damage: 15,
  enemiesDefeated: 0,
  wavesCompleted: 0,
  totalKills: 0,
  hirelings: [
    { id: "h1", type: "none" },
    { id: "h2", type: "none" },
    { id: "h3", type: "none" },
  ],
  assistants: [],
};

const enemyDatabase: Record<EnemyType, { name: string; baseHp: number; damage: number; xpReward: number; goldReward: number }> = {
  Slime:       { name: "Slime",      baseHp: 10,  damage: 2,  xpReward: 5,   goldReward: 1 },
  Rat:         { name: "Rat",        baseHp: 20,  damage: 4,  xpReward: 8,   goldReward: 2 },
  Goblin:      { name: "Goblin",     baseHp: 35,  damage: 6,  xpReward: 12,  goldReward: 4 },
  Wolf:        { name: "Wolf",      baseHp: 50,  damage: 8,  xpReward: 16,  goldReward: 5 },
  Skeleton:    { name: "Skeleton",   baseHp: 70,  damage: 12, xpReward: 24,  goldReward: 7 },
  Orc:         { name: "Orc",       baseHp: 100, damage: 16, xpReward: 32,  goldReward: 10 },
  Dragon:      { name: "Dragon",     baseHp: 250, damage: 30, xpReward: 100, goldReward: 50 },
};

// ============================================================================
// MAIN STORE
// ============================================================================

export const [gameState, setGameState] = createStore<GameState>({
  isPlaying: false,
  isGameOver: false,
  gameState: "START",
  saveVersion: 1,
  player: { ...defaultPlayer },
  currentEnemyIndex: -1,
  enemies: [],
  totalWaves: TOTAL_WAVES,
  lootDrops: [],
  inventory: {},
  combatLog: [],
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate enemy for a specific wave with level scaling
 */
export function generateEnemy(waveIndex: number, playerLevel: number): Enemy {
  const waveMultiplier = 1 + (waveIndex * 0.15);
  
  // Determine enemy type based on wave
  const types: EnemyType[] = ["Slime", "Rat", "Goblin", "Wolf", "Skeleton", "Orc"];
  const typeIndex = waveIndex % types.length;
  const enemyType = types[typeIndex];

  // Scale stats with wave and player level (diminishing returns)
  const scaleFactor = Math.min(1.5, waveMultiplier * (0.9 + playerLevel * 0.05));

  const { name, baseHp, damage, xpReward, goldReward } = enemyDatabase[enemyType];

  return {
    id: Date.now() + waveIndex, // Unique ID for tracking
    name,
    maxHp: Math.floor(baseHp * scaleFactor),
    currentHp: baseHp * scaleFactor,
    level: 1 + Math.floor((waveIndex - typeIndex) / types.length),
    damage: Math.floor(damage * scaleFactor),
    xpReward: Math.floor(xpReward * waveMultiplier),
    goldReward: Math.floor(goldReward * waveMultiplier),
    type: enemyType,
  };
}

/**
 * Get available enemies for a wave (returns all enemy types)
 */
export function getWaveEnemies(waveIndex: number): Enemy[] {
  const types: EnemyType[] = ["Slime", "Rat", "Goblin", "Wolf", "Skeleton", "Orc"];
  const enemies: Enemy[] = [];

  for (const type of types) {
    const enemyTypeData = enemyDatabase[type];
    const waveMultiplier = 1 + (waveIndex * 0.15);
    const scaleFactor = Math.min(1.5, waveMultiplier * (0.9 + 1 * 0.05)); // Base level 1 for spawn enemies
    
    const enemy: Enemy = {
      id: Date.now() + waveIndex + types.indexOf(type),
      name: enemyTypeData.name,
      maxHp: Math.floor(enemyTypeData.baseHp * scaleFactor),
      currentHp: enemyTypeData.baseHp * scaleFactor,
      level: 1 + Math.floor((waveIndex - types.indexOf(type)) / types.length),
      damage: Math.floor(enemyTypeData.damage * scaleFactor),
      xpReward: Math.floor(enemyTypeData.xpReward * waveMultiplier),
      goldReward: Math.floor(enemyTypeData.goldReward * waveMultiplier),
      type,
    };
    enemies.push(enemy);
  }

  return enemies;
}

/**
 * Get enemy type by wave index (for UI display)
 */
export function getEnemyTypeForWave(waveIndex: number): EnemyType {
  const types: EnemyType[] = ["Slime", "Rat", "Goblin", "Wolf", "Skeleton", "Orc"];
  return types[waveIndex % types.length];
}

/**
 * Calculate player stats for a specific level
 */
export function calculatePlayerStatsForLevel(level: number): Player {
  return {
    name: "Warrior",
    level,
    hp: Math.floor(100 * Math.pow(1.15, level - 1)),
    maxHp: Math.floor(100 * Math.pow(1.15, level - 1)),
    gold: 0,
    xp: (level - 1) * 100,
    nextLevelXp: level * 100,
    damage: Math.floor(15 + (level - 1) * 2),
    enemiesDefeated: 0,
    wavesCompleted: 0,
    totalKills: 0,
    hirelings: [
      { id: "h1", type: "none" },
      { id: "h2", type: "none" },
      { id: "h3", type: "none" },
    ],
    assistants: [],
  };
}

/**
 * Check if player has reached the final wave
 */
export function isFinalWave(waveIndex: number): boolean {
  return waveIndex >= TOTAL_WAVES - 1;
}

/**
 * Calculate XP multiplier based on level difference
 */
export function getXpMultiplier(enemyLevel: number, playerLevel: number): number {
  const diff = enemyLevel - playerLevel;
  if (diff <= 0) return 1.0; // Same or weaker
  return 1.0 - (diff * 0.05); // Penalty for facing stronger enemies
}

/**
 * Calculate gold multiplier based on level difference
 */
export function getGoldMultiplier(enemyLevel: number, playerLevel: number): number {
  const diff = enemyLevel - playerLevel;
  if (diff <= 0) return 1.2; // Bonus for facing weaker enemies
  return 0.8 - (diff * 0.01); // Penalty for facing stronger enemies
}

// ============================================================================
// LOOT SYSTEM
// ============================================================================

/**
 * Add a loot drop to the log
 */
export function addLootDrop(item: Item, goldValue: number): void {
  const drop: LootDrop = {
    id: `loot-${Date.now()}`,
    timestamp: new Date(),
    item,
    goldValue,
  };
  
  setGameState("lootDrops", (drops) => [...drops, drop]);
  
  // Add to inventory
  setGameState("inventory", item.id, (count = 0) => count + 1);
  
  // Add to combat log
  addCombatLog("loot", `Found ${item.name} (${item.rarity})!`);
}

/**
 * Clear all loot drops
 */
export function clearLootDrops(): void {
  setGameState("lootDrops", []);
}

// ============================================================================
// COMBAT LOG
// ============================================================================

/**
 * Add entry to combat log
 */
export function addCombatLog(
  type: "damage" | "heal" | "gold" | "xp" | "loot",
  message: string
): void {
  const entry = {
    timestamp: new Date().toISOString(),
    type,
    message,
  };
  
  setGameState("combatLog", (log) => [...log, entry].slice(-100)); // Keep last 100 entries
}

// ============================================================================
// PERSISTENCE (LocalStorage)
// ============================================================================

const SAVE_KEY = "rakanishu";

/**
 * Save game state to localStorage
 */
export function saveGame(): void {
  try {
    const saveData = {
      version: gameState.saveVersion,
      player: gameState.player,
      lootDrops: gameState.lootDrops.map((drop) => ({
        ...drop,
        timestamp: drop.timestamp.toISOString(), // Convert Date to string
      })),
      inventory: gameState.inventory,
      combatLog: gameState.combatLog.slice(-50), // Save last 50 entries
    };
    
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch (error) {
    console.error("Failed to save game:", error);
  }
}

/**
 * Load game state from localStorage
 */
export function loadGame(): boolean {
  try {
    const saveData = localStorage.getItem(SAVE_KEY);
    if (!saveData) return false;
    
    const parsed = JSON.parse(saveData);
    
    // Hydrate with reconcile to preserve reactivity
    setGameState("player", reconcile(parsed.player));
    setGameState("inventory", reconcile(parsed.inventory));
    setGameState("combatLog", reconcile(parsed.combatLog));
    
    // Convert timestamp strings back to Date objects
    const lootDrops = parsed.lootDrops.map((drop: any) => ({
      ...drop,
      timestamp: new Date(drop.timestamp),
    }));
    setGameState("lootDrops", reconcile(lootDrops));
    
    return true;
  } catch (error) {
    console.error("Failed to load game:", error);
    return false;
  }
}

/**
 * Reset game to default state
 */
export function resetGame(): void {
  setGameState(reconcile({
    isPlaying: false,
    isGameOver: false,
    gameState: "START",
    saveVersion: 1,
    player: { ...defaultPlayer },
    currentEnemyIndex: -1,
    enemies: [],
    totalWaves: TOTAL_WAVES,
    lootDrops: [],
    inventory: {},
    combatLog: [],
  }));
  
  localStorage.removeItem(SAVE_KEY);
}
