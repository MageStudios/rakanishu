/**
 * Persistent Game State Module (Module-Level Store)
 */
import { createEffect } from 'solid-js';

// Initialize at module load (Single Source of Truth)
export const initialGameState = {
  player: { hp: 100, maxHp: 100, level: 1, xp: 0 },
  enemy: { name: "Shade", hp: 50, maxHp: 50, level: 1 },
  tick: { count: 0 },
  settings: { debugMode: false }
};

// Store state (NO signals for global state)
export const gameState = initialGameState;

/**
 * Setters: Path-based only ("player", "hp") to maintain reactivity
 */
export function setGameState(key: string, subKey?: any, value?: number) {
  if (key === "player") {
    gameState["player"][subKey] = value;
  } else if (key === "enemy") {
    gameState["enemy"][subKey] = value;
  } else if (key === "tick") {
    gameState["tick"][subKey] = value;
  }
}

/**
 * Ticker-driven game loop (NO manual clicks allowed)
 */
export function tick() {
  gameState["tick"]["count"] += 1;

  // Combat resolution (Ephemeral handled externally via combatState)
  if (gameState["enemy"]["hp"] <= 0) {
    // Victory: Heal player, advance level
    gameState["player"]["hp"] = Math.min(gameState["player"]["maxHp"], gameState["player"]["hp"] + 20);
    gameState["enemy"] = { name: "Shade", hp: 50, maxHp: 50, level: 1 }; // Reset enemy
    return "victory";
  }

  if (gameState["player"]["hp"] <= 0) {
    gameState["player"] = { hp: 1, maxHp: 100, level: gameState["player"]["level"], xp: 0 }; // Forced heal, next tick death
    return "death";
  }

  // Auto-combat resolution (simulated tick)
  const damage = Math.floor(Math.random() * 10) + 5; // Base enemy damage
  gameState["player"]["hp"] -= damage;

  return "combat_cont";
}

// Side-effect for reactiveness (monitor HP) - careful with performance
createEffect(() => {
  const p = gameState["player"];
  if (p.hp <= 0) {
    console.error("Player died! (Manual intervention required)");
  }
});