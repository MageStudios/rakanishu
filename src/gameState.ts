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
  // Respawn tracking
  respawnTimer?: number; // in ticks (0 = ready to spawn)
}

export type EnemyType = "Slime" | "Rat" | "Goblin" | "Wolf" | "Skeleton" | "Orc" | "Dragon";

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
}

export interface GameState {
  isPlaying: boolean;
  isGameOver: boolean;
  gameState: "START" | "PLAYING" | "WON" | "LOST";
  player: Player;
  currentEnemyIndex: number; // -1 means no enemy active
  enemies: Enemy[];
  totalWaves: number;
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
  player: { ...defaultPlayer },
  currentEnemyIndex: -1,
  enemies: [],
  totalWaves: TOTAL_WAVES,
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
      id: Date.now() + waveIndex,
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
