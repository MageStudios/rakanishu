/**
 * Equipment Component — D2-style Equipment Panel
 * Shows equipped items with rarity-colored borders.
 */
import { Component } from 'solid-js';
import { gameState, unequipItem, getItemColor } from '../state/gameState';
import type { InventoryEntry } from '../state/gameState';

const Equipment: Component = () => {
  const slots: { key: 'weapon' | 'armor' | 'shield' | 'helm'; label: string }[] = [
    { key: 'weapon', label: 'Weapon' },
    { key: 'armor', label: 'Armor' },
    { key: 'shield', label: 'Shield' },
    { key: 'helm', label: 'Helm' },
  ];

  // Gothic-aligned border glow using palette colors only
  const rarityBorder = (item: InventoryEntry): string => {
    if (item.type === 'rune') return 'border-runeOrange';
    if (item.isSuperior) return 'border-superiorGold';
    switch (item.quality) {
      case 'unique': return 'border-uniqueGreen';
      case 'set': return 'border-setGreen';
      case 'rare': return 'border-rareYellow';
      case 'magic': return 'border-magicBlue';
      case 'crafted': return 'border-craftedOrange';
      case 'low': return 'border-grayLow';
      default: return 'border-normalGray';
    }
  };

  const handleUnequip = (key: 'weapon' | 'armor' | 'shield' | 'helm') => {
    unequipItem(key);
  };

  return (
    <div class="panel">
      <h2 class="text-bone text-xl mb-4">Equipment</h2>
      <div class="grid grid-cols-2 gap-3">
        {slots.map((slot) => {
          const item = gameState.equipment[slot.key] as InventoryEntry | null;
          const border = item ? rarityBorder(item) : 'border-obsidian';
          const bg = item ? 'bg-panel/80' : 'bg-obsidian';
          const clr = item ? getItemColor(item) : '#4a4438';

          return (
            <div class={`p-3 border-2 ${border} ${bg} min-h-[80px]`} key={slot.key}>
              <div class="bone-dim text-xs uppercase tracking-wider">{slot.label}</div>
              {item ? (
                <>
                  <div style={{ color: clr }} class="font-medium text-sm mt-1">
                    {item.name}
                  </div>
                  <div class="bone-dim text-xs mt-0.5">
                    {item.damage && `⚔ ${item.damage.min}-${item.damage.max}`}
                    {item.defense && ` 🛡 ${item.defense}`}
                    {item.runeSockets && item.runeSockets > 0 && ` ◇${item.runeSockets}`}
                  </div>
                  <button
                    class="mt-2 text-xs px-2 py-0.5 bg-blood-red/20 border border-blood-red text-bone hover:bg-blood-red/40 transition-colors"
                    onClick={() => handleUnequip(slot.key)}
                  >
                    Remove
                  </button>
                </>
              ) : (
                <div class="bone-dim text-xs italic mt-1">Empty</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Equipment;
