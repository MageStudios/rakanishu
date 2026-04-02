import { createStore } from 'solid-js/store';

// 1. Define the Interfaces
interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  rarity: 'normal' | 'magic' | 'rare' | 'set' | 'unique';
  stats: Record<string, number>;
}

interface Player {
  hp: number;
  gold: number;
  xp: number;
  level: number;
  inventory: InventoryItem[];
  achievements: string[];
}

interface Combatant {
  id: string;
  type: 'player' | 'enemy';
  position: { x: number; y: number };
  hp: number;
  attack: number;
  defense: number;
}

// 2. Define the Master State Interface (The Blueprint)
interface GameState {
  player: Player;
  inventory: InventoryItem[];
  combatLog: string[];
  world: {
    npcs: Combatant[];
    enemies: Combatant[];
  };
}

// 3. Initialize the Store with the <GameState> type
export const [gameState, setGameState] = createStore<GameState>({
  player: {
    hp: 100,
    gold: 0,
    xp: 0,
    level: 1,
    inventory: [],
    achievements: []
  },
  inventory: [],
  combatLog: [],
  world: {
    npcs: [],
    enemies: []
  }
});

// 4. Update functions (Note: gameState is now an object, not a function call!)
export function addLootDrop(item: InventoryItem) {
  setGameState('inventory', (inv) => [
    ...inv, 
    { ...item, id: crypto.randomUUID() }
  ]);
}

export function addCombatLog(message: string) {
  setGameState('combatLog', (logs) => [...logs, message]);
}