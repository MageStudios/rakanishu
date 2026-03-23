/**
 * SNIPPET: Add New Enemy Type
 * 
 * Use this template when adding a new enemy to the game.
 * Copy/paste and modify the values.
 */

// ============================================================================
// STEP 1: Add to enemyDatabase in src/gameState.ts
// ============================================================================

export const enemyDatabase: Record<EnemyType, { name: string; baseHp: number; damage: number; xpReward: number; goldReward: number }> = {
  Slime:       { name: "Slime",      baseHp: 10,  damage: 2,  xpReward: 5,   goldReward: 1 },
  Rat:         { name: "Rat",        baseHp: 20,  damage: 4,  xpReward: 8,   goldReward: 2 },
  // ... existing enemies ...
  
  // ADD YOUR NEW ENEMY HERE:
  NewEnemy:    { name: "NewEnemy",   baseHp: 100, damage: 15, xpReward: 30,  goldReward: 10 },
};

// ============================================================================
// STEP 2: Update EnemyType union in src/gameState.ts or src/store/types.ts
// ============================================================================

export type EnemyType = 
  | "Slime" 
  | "Rat" 
  | "Goblin" 
  | "Wolf" 
  | "Skeleton" 
  | "Orc"
  | "NewEnemy";  // ← ADD HERE

// ============================================================================
// STEP 3: Update wave generation in src/gameState.ts (if needed)
// ============================================================================

// If you want this enemy to appear in waves:
export function getWaveEnemies(waveIndex: number): Enemy[] {
  const types: EnemyType[] = [
    "Slime", 
    "Rat", 
    "Goblin", 
    "Wolf", 
    "Skeleton", 
    "Orc",
    "NewEnemy"  // ← ADD HERE
  ];
  
  // ... rest of function
}

// ============================================================================
// EXAMPLE VALUES (Common Enemy Types)
// ============================================================================

/*
EARLY GAME (Weak):
- baseHp: 10-30
- damage: 2-8
- xpReward: 5-15
- goldReward: 1-5

MID GAME (Medium):
- baseHp: 50-100
- damage: 10-20
- xpReward: 20-40
- goldReward: 5-15

LATE GAME (Strong):
- baseHp: 150-300
- damage: 25-50
- xpReward: 50-100
- goldReward: 20-50

BOSS:
- baseHp: 500+
- damage: 50+
- xpReward: 150+
- goldReward: 100+
*/

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/*
After adding enemy:
□ Enemy appears in game
□ Correct HP/damage values
□ Drops correct XP/gold
□ Name displays correctly
□ Respawn timer works
□ No console errors
*/
