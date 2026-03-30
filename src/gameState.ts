import { createSignal } from 'solid-js';

interface Player {
  hp: number;
  gold: number;
  xp: number;
  level: number;
  inventory: InventoryItem[];
  achievements: string[];
}

interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  rarity: 'normal' | 'magic' | 'rare' | 'set' | 'unique';
  stats: Record<string, number>;
}

interface Combatant {
  id: string;
  type: 'player' | 'enemy';
  position: { x: number; y: number };
  hp: number;
  attack: number;
  defense: number;
}

export const [gameState, setGameState] = createSignal<{
  player: Player;
  inventory: InventoryItem[];
  combatLog: string[];
  world: {
    npcs: Combatant[];
    enemies: Combatant[];
  };
}>({
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

export function addLootDrop(item: InventoryItem) {
  setGameState('inventory', [...gameState().inventory, { ...item, id: crypto.randomUUID() }]);
}

export function addCombatLog(message: string) {
  setGameState('combatLog', [...gameState().combatLog, message]);
}
