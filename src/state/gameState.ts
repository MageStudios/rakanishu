import { createStore } from 'solid-js/store';

interface LootItem {
  id: string;
  name: string;
  type: 'item' | 'currency' | 'consumable';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  baseChance?: number;
}

interface DropTable {
  id: string;
  name: string;
  items: LootItem[];
  enemyLevel: number;
  lootType: 'melee' | 'ranged' | 'magic';
}

export const [gameState, setGameState] = createStore({
  lootDrops: {
    dropTables: [] as DropTable[],
    currentDropTable: null as DropTable | null,
    itemsInInventory: [] as LootItem[]
  }
});