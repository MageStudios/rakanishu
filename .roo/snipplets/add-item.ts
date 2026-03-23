/**
 * SNIPPET: Add New Item
 * 
 * Use this template when adding consumables, weapons, or armor.
 * Copy/paste and modify the values.
 */

// ============================================================================
// STEP 1: Define item interface (if not already in gameState.ts)
// ============================================================================

export interface Item {
  id: string;                          // Unique identifier
  name: string;                        // Display name
  type: "weapon" | "armor" | "consumable";
  rarity: "normal" | "magic" | "rare" | "unique";
  value: number;                       // Gold value
  
  // Optional properties (depending on type):
  damage?: number;                     // For weapons
  defense?: number;                    // For armor
  healAmount?: number;                 // For potions
  effect?: string;                     // For special items
}

// ============================================================================
// STEP 2: Add to item database (create if needed)
// ============================================================================

export const itemDatabase: Record<string, Item> = {
  // Consumables
  "health-potion": {
    id: "health-potion",
    name: "Health Potion",
    type: "consumable",
    rarity: "normal",
    value: 10,
    healAmount: 50
  },
  
  "mana-potion": {
    id: "mana-potion",
    name: "Mana Potion",
    type: "consumable",
    rarity: "normal",
    value: 15,
    effect: "Restores 50 mana"
  },
  
  // Weapons
  "iron-sword": {
    id: "iron-sword",
    name: "Iron Sword",
    type: "weapon",
    rarity: "normal",
    value: 50,
    damage: 10
  },
  
  "fire-staff": {
    id: "fire-staff",
    name: "Staff of Flames",
    type: "weapon",
    rarity: "magic",
    value: 200,
    damage: 25,
    effect: "Deals fire damage"
  },
  
  // Armor
  "leather-armor": {
    id: "leather-armor",
    name: "Leather Armor",
    type: "armor",
    rarity: "normal",
    value: 40,
    defense: 5
  },
  
  // ADD YOUR ITEM HERE:
  "new-item": {
    id: "new-item",
    name: "New Item Name",
    type: "consumable",  // or "weapon" or "armor"
    rarity: "normal",
    value: 10,
    healAmount: 30  // or damage, defense, etc.
  }
};

// ============================================================================
// STEP 3: Add to loot drop logic (if it should drop from enemies)
// ============================================================================

function handleEnemyDeath(enemy: Enemy) {
  // Example loot drop logic:
  const roll = Math.random();
  
  if (roll < 0.20) {
    // 20% chance: Health potion
    addToInventory("health-potion", 1);
  } else if (roll < 0.25) {
    // 5% chance: Weapon or armor
    const items = ["iron-sword", "leather-armor", "new-item"];
    const randomItem = items[Math.floor(Math.random() * items.length)];
    addToInventory(randomItem, 1);
  } else {
    // 75% chance: Gold
    const goldAmount = Math.floor(enemy.goldReward * (0.8 + Math.random() * 0.4));
    setGameState("player", "gold", g => g + goldAmount);
  }
}

// ============================================================================
// STEP 4: Add to inventory system
// ============================================================================

// Inventory uses Record<itemId, quantity>
function addToInventory(itemId: string, quantity: number) {
  setGameState("inventory", itemId, (qty) => (qty || 0) + quantity);
}

function removeFromInventory(itemId: string, quantity: number) {
  setGameState("inventory", itemId, (qty) => Math.max(0, (qty || 0) - quantity));
}

function useItem(itemId: string) {
  const item = itemDatabase[itemId];
  
  if (!item) return;
  
  switch (item.type) {
    case "consumable":
      if (item.healAmount) {
        setGameState("player", "hp", hp => 
          Math.min(gameState.player.maxHp, hp + item.healAmount)
        );
      }
      removeFromInventory(itemId, 1);
      break;
      
    case "weapon":
      // Equip weapon logic
      setGameState("player", "damage", item.damage || 0);
      break;
      
    case "armor":
      // Equip armor logic
      setGameState("player", "defense", item.defense || 0);
      break;
  }
}

// ============================================================================
// STEP 5: Add UI component (optional)
// ============================================================================

// Example inventory item component:
function InventoryItem(props: { itemId: string; quantity: number }) {
  const item = itemDatabase[props.itemId];
  
  const rarityColors = {
    normal: "text-[#d1d1d1]",
    magic: "text-blue-400",
    rare: "text-yellow-400",
    unique: "text-[#ffd700]"
  };
  
  return (
    <div class="flex items-center justify-between p-2 bg-[#1a1a1a] rounded">
      <span class={rarityColors[item.rarity]}>
        {item.name} x{props.quantity}
      </span>
      <button 
        class="px-2 py-1 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded"
        onClick={() => useItem(props.itemId)}
      >
        Use
      </button>
    </div>
  );
}

// ============================================================================
// RARITY COLOR REFERENCE
// ============================================================================

/*
Normal (Gray):   text-[#d1d1d1]
Magic (Blue):    text-blue-400 or text-[#4a9eff]
Rare (Yellow):   text-yellow-400 or text-[#ffd700]
Unique (Gold):   text-[#ffd700] with glow effect
*/

// ============================================================================
// EXAMPLE VALUES (Common Item Types)
// ============================================================================

/*
CONSUMABLES:
- Health Potion: value 10-20, healAmount 30-100
- Mana Potion: value 15-25, effect "Restores mana"
- Buff Potion: value 50-100, effect "Temporary stat boost"

WEAPONS:
- Common: value 20-100, damage 5-20
- Magic: value 100-500, damage 20-40, effect
- Rare: value 500-2000, damage 40-80, effect
- Unique: value 2000+, damage 80+, special effect

ARMOR:
- Common: value 30-80, defense 3-10
- Magic: value 80-400, defense 10-25, effect
- Rare: value 400-1500, defense 25-50, effect
- Unique: value 1500+, defense 50+, special effect
*/

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/*
After adding item:
□ Item appears in loot drops
□ Correct name/description
□ Rarity color displays correctly
□ Value is appropriate
□ Can be used/equipped
□ Effect works as intended
□ Inventory updates correctly
□ No console errors
*/
