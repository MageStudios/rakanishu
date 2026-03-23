import { createEffect, createMemo } from "solid-js";
import { createStore, reconcile } from "solid-js/store";

import type {
  Enemy,
  Player,
  GameState,
  EnemyType,
} from "./gameState";

import { batch } from "solid-js";

// ============================================================================
// CONFIGURATION
// ============================================================================

export const COMBAT_TICK_MS = 100; // Fixed timestep for consistent game speed
export const MAX_HIRELINGS = 3;
export const RESPAWN_TICKS = 30; // Enemy respawns after X ticks when HP reaches 0
export const MAX_ENEMIES_ON_SCREEN = 6; // Max enemies in combat at once

// ============================================================================
// COMBAT STORE (Enemy List & Combat State)
// ============================================================================

/**
 * Individual Enemy in combat (not the same as gameState.Enemy)
 */
export interface CombatEnemy {
  id: number; // Unique ID
  enemyIndex: number; // Index in the enemies array for easy lookup
  name: string;
  maxHp: number;
  currentHp: number;
  damage: number;
  xpReward: number;
  goldReward: number;
  type: EnemyType;
  respawnTimer?: number; // 0 = ready, >0 = counting down
}

export const [combatState, setCombatState] = createStore({
  enemies: [] as CombatEnemy[],
  playerStats: { hp: 0, maxHp: 0, damage: 0 } as {
    hp: number;
    maxHp: number;
    damage: number;
  },
  isCombatActive: false,
  lastTickTime: 0, // For fixed timestep
  tickCount: 0,
});

// ============================================================================
// COMBAT LOGIC FUNCTIONS
// ============================================================================

/**
 * Initialize combat for a wave
 */
export function initializeCombat(
  gameState: GameState,
  enemies: Enemy[],
): CombatEnemy[] {
  // Limit to MAX_ENEMIES_ON_SCREEN
  const activeEnemies = enemies.slice(0, MAX_ENEMIES_ON_SCREEN);
  
  return activeEnemies.map((enemy) => ({
    id: enemy.id,
    enemyIndex: enemies.indexOf(enemy),
    name: enemy.name,
    maxHp: enemy.maxHp,
    currentHp: enemy.currentHp,
    damage: enemy.damage,
    xpReward: enemy.xpReward,
    goldReward: enemy.goldReward,
    type: enemy.type,
    respawnTimer: 0, // Ready to spawn if killed
  }));
}

/**
 * Resolve a single combat tick (WHIRLWIND AoE)
 * Both player and ALL enemies attack simultaneously
 */
export function resolveCombatTick(
  combatStateRef: typeof combatState,
  playerStats: Player,
): { hitsDealt: number; damageDealtToPlayer?: number } {
  let hitsDealt = 0;
  let totalDamageToPlayer = 0;

  // Use batch for performance - single DOM update per tick regardless of enemy count
  batch(() => {
    // ------------------------------------------------------------------------
    // PHASE 1: Start of tick - Handle respawns
    // ------------------------------------------------------------------------
    
    for (let i = 0; i < combatStateRef.enemies.length; i++) {
      const enemy = combatStateRef.enemies[i];

      // Check respawn timer first - spawn new monster if ready
      if (enemy.respawnTimer !== undefined && enemy.respawnTimer > 0) {
        setCombatState("enemies", i, "respawnTimer", (timer) => timer! - 1);

        if (combatStateRef.enemies[i].respawnTimer === 0) {
          // Reset HP to maxHp - ENEMY SPAWNS!
          setCombatState("enemies", i, {
            ...enemy,
            currentHp: enemy.maxHp,
            respawnTimer: 0,
          });
        }
        continue;
      }
    }

    // ------------------------------------------------------------------------
    // PHASE 2: Enemy attacks player (all enemies with HP > 0)
    // ------------------------------------------------------------------------

    combatStateRef.enemies.forEach((enemy) => {
      // Only attacking enemies that are alive
      if (enemy.currentHp <= 0) return;

      // Apply damage to player
      const damageDealt = Math.max(1, enemy.damage);
      totalDamageToPlayer += damageDealt;
    });

    if (totalDamageToPlayer > 0) {
      setCombatState("playerStats", "hp", (currentHp) => 
        Math.max(0, currentHp - totalDamageToPlayer)
      );
    }

    // ------------------------------------------------------------------------
    // PHASE 3: Player attacks all enemies (WHIRLWIND AoE)
    // ------------------------------------------------------------------------

    const playerDamage = playerStats.damage;

    combatStateRef.enemies.forEach((enemy, index) => {
      if (enemy.currentHp <= 0 && enemy.respawnTimer === undefined) {
        // Enemy already dead and not respawning - mark for removal
        return;
      }

      if (enemy.currentHp <= 0) {
        // Enemy is dead but respawning
        return;
      }

      // Calculate damage based on enemy level vs player level
      const xpMultiplier = getXpMultiplier(enemy, playerStats);
      let damageDealt = Math.max(1, Math.floor(playerDamage * xpMultiplier));

      // Apply damage to enemy
      const newHp = Math.max(0, enemy.currentHp - damageDealt);
      setCombatState("enemies", index, "currentHp", newHp);

      // If enemy just died, set respawn timer
      if (newHp === 0 && enemy.currentHp > 0) {
        setCombatState("enemies", index, "respawnTimer", RESPAWN_TICKS);
      }

      // Track hits for UI
      hitsDealt++;
    });

    // ------------------------------------------------------------------------
    // PHASE 4: Check for player death
    // ------------------------------------------------------------------------

    const currentPlayerHp = combatStateRef.playerStats.hp;
    if (currentPlayerHp <= 0) {
      setCombatState("playerStats", "hp", playerStats.maxHp); // Respawn
      throw new Error("Player died! Combat ending.");
    }

    // Remove dead enemies without respawn timers
    setCombatState("enemies", (enemies) => 
      enemies.filter((e) => e.currentHp > 0 || e.respawnTimer !== undefined)
    );
  });

  setCombatState("tickCount", (count) => count + 1);

  return { hitsDealt, damageDealtToPlayer: totalDamageToPlayer };
}

/**
 * Check if player has won (defeated all waves)
 */
export function checkVictory(
  gameState: GameState,
  playerStats: Player
): boolean {
  return playerStats.wavesCompleted >= gameState.totalWaves;
}

/**
 * Calculate XP gain for defeating an enemy
 */
export function calculateXpGain(
  enemy: Enemy,
  playerStats: Player
): number {
  const xpMultiplier = getXpMultiplier(enemy, playerStats);
  return Math.floor(enemy.xpReward * xpMultiplier);
}

/**
 * Calculate gold gain for defeating an enemy
 */
export function calculateGoldGain(
  enemy: Enemy,
  playerStats: Player
): number {
  const goldMultiplier = getGoldMultiplier(enemy, playerStats);
  return Math.floor(enemy.goldReward * goldMultiplier);
}

/**
 * Apply level up bonuses to player
 */
export function applyLevelUp(
  playerStats: Player,
  newLevel: number
): { goldBonus: number; hpBonus: number } {
  const levelUpMultiplier = Math.min(2.0, 1 + (newLevel * 0.1));

  const goldBonus = Math.floor(playerStats.gold * (levelUpMultiplier - 1));
  const hpBonus = Math.floor(playerStats.maxHp * 0.3);

  return { goldBonus, hpBonus };
}

// ============================================================================
// UTILITIES (copied from gameState.ts for module independence)
// ============================================================================

function getEnemyTypeForWave(waveIndex: number): EnemyType {
  const types: EnemyType[] = ["Slime", "Rat", "Goblin", "Wolf", "Skeleton", "Orc"];
  return types[waveIndex % types.length];
}

function getWaveMultiplier(waveIndex: number): number {
  return 1 + (waveIndex * 0.15);
}

function getEnemyData(type: EnemyType): { name: string; baseHp: number; damage: number; xpReward: number; goldReward: number } {
  const data: Record<EnemyType, { name: string; baseHp: number; damage: number; xpReward: number; goldReward: number }> = {
    Slime:       { name: "Slime",      baseHp: 10,  damage: 2,  xpReward: 5,   goldReward: 1 },
    Rat:         { name: "Rat",        baseHp: 20,  damage: 4,  xpReward: 8,   goldReward: 2 },
    Goblin:      { name: "Goblin",     baseHp: 35,  damage: 6,  xpReward: 12,  goldReward: 4 },
    Wolf:        { name: "Wolf",      baseHp: 50,  damage: 8,  xpReward: 16,  goldReward: 5 },
    Skeleton:    { name: "Skeleton",   baseHp: 70,  damage: 12, xpReward: 24,  goldReward: 7 },
    Orc:         { name: "Orc",       baseHp: 100, damage: 16, xpReward: 32,  goldReward: 10 },
    Dragon:      { name: "Dragon",     baseHp: 250, damage: 30, xpReward: 100, goldReward: 50 },
  };
  return data[type];
}

/**
 * Calculate XP multiplier based on level difference
 */
export function getXpMultiplier(enemy: CombatEnemy | Enemy, playerStats: Player): number {
  const enemyLevel = 'level' in enemy ? enemy.level : 1;
  const diff = enemyLevel - playerStats.level;
  if (diff <= 0) return 1.0; // Same or weaker
  return 1.0 - (diff * 0.05); // Penalty for facing stronger enemies
}

/**
 * Calculate gold multiplier based on level difference
 */
export function getGoldMultiplier(enemy: CombatEnemy | Enemy, playerStats: Player): number {
  const enemyLevel = 'level' in enemy ? enemy.level : 1;
  const diff = enemyLevel - playerStats.level;
  if (diff <= 0) return 1.2; // Bonus for facing weaker enemies
  return 0.8 - (diff * 0.01); // Penalty for facing stronger enemies
}

// ============================================================================
// CREATE EFFECTS FOR GAME LOOP
// ============================================================================

/**
 * Main combat loop effect - runs every COMBAT_TICK_MS
 */
export function createCombatLoop(
  gameState: GameState,
  combatStateRef: typeof combatState
): () => void {
  let animationFrameId: number;

  const tick = (): void => {
    if (!gameState.isPlaying || gameState.isGameOver) return;

    const now = performance.now();
    
    // Skip if not enough time has passed (fixed timestep)
    if (now - combatStateRef.lastTickTime < COMBAT_TICK_MS) {
      animationFrameId = requestAnimationFrame(tick);
      return;
    }

    // Reset timestamp for next tick
    setCombatState("lastTickTime", now);

    // Get current player stats (reactive)
    const playerStats = gameState.player;

    try {
      // Resolve one tick of combat (WHIRLWIND AoE)
      resolveCombatTick(combatStateRef, playerStats);
    } catch (e) {
      // Player died - end game
      console.error("Combat error:", e);
      // Handle game over state here
    }

    // Check for victory after each tick
    if (checkVictory(gameState, playerStats)) {
      console.log("Victory!");
      // Handle victory state here
    }

    animationFrameId = requestAnimationFrame(tick);
  };

  // Start the loop
  setCombatState("lastTickTime", performance.now());
  animationFrameId = requestAnimationFrame(tick);

  // Return cleanup function
  return () => {
    cancelAnimationFrame(animationFrameId);
  };
}

/**
 * Handle player death and respawn (for testing/playtesting)
 */
export function handlePlayerDeath(
  playerMaxHp: number
): void {
  // Respawn player at max HP
  setCombatState("playerStats", "hp", playerMaxHp);

  // Remove all defeated enemies (respawn timers will reset them)
  setCombatState("enemies", (enemies) => 
    enemies.filter((enemy) => enemy.currentHp > 0 || enemy.respawnTimer !== undefined)
  );
}
