/**
 * Equipment Component — D2-style Equipment Grid
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

  // D2R-aligned border glow
  const rarityBorder = (item: InventoryEntry): string => {
    if (item.type === 'rune') return 'border-orange-500';
    if (item.isSuperior) return 'border-yellow-600';
    switch (item.quality) {
      case 'unique': return 'border-amber-400';
      case 'set': return 'border-green-500';
      case 'rare': return 'border-yellow-400';
      case 'magic': return 'border-blue-600';
      case 'crafted': return 'border-orange-400';
      case 'low': return 'border-gray-500';
      default: return 'border-gray-600';
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
          const border = item ? rarityBorder(item) : 'border-stone-800';
          const bg = item ? 'bg-panel/80' : 'bg-obsidian/60';
          const clr = item ? getItemColor(item) : '#4a4438';

          return (
            <div class={`p-3 border ${border} ${bg} min-h-[80px]`}>
              <div class="text-stone-600 text-xs uppercase tracking-wider">{slot.label}</div>
              {item ? (
                <>
                  <div style={{ color: clr }} class="font-medium text-sm mt-1">
                    {item.name}
                  </div>
                  <div class="text-stone-500 text-xs mt-0.5">
                    {item.damage && `⚔ ${item.damage.min}-${item.damage.max}`}
                    {item.defense && `🛡 ${item.defense}`}
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
                <div class="text-stone-700 text-xs italic mt-1">Empty</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Equipment;
