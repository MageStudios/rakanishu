/* @refresh reload */
/**
 * LootLog Component — Displays dropped items with D2R rarity coloring.
 * Reads directly from the module-level gameState store.
 */
import { Component, For } from 'solid-js';
import { gameState, getItemColor, socketItem, equipItem } from '../state/gameState';
import type { InventoryEntry } from '../state/gameState';

const LootLog: Component = () => {
  const runes = () => gameState.inventory.filter((i: InventoryEntry) => i.type === 'rune').reverse();
  const gear = () => gameState.inventory.filter((i: InventoryEntry) => i.type !== 'rune').reverse();

  return (
    <div class="panel">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-bone text-xl">Loot Log</h2>
        <span class="text-xs bone-dim" style="color: #D4A43C">Time: {gameState.formattedTime}</span>
      </div>

      {/* Runes Section */}
      {runes().length > 0 && (
        <div class="mb-4">
          <div class="bone-dim text-xs uppercase tracking-wider mb-2">Runes</div>
          <div class="space-y-1">
            <For each={runes()}>
              {(rune) => (
                <div class="flex justify-between items-center px-2 py-1 bg-obsidian border-l-2 border-blood-red">
                  <span class="text-sm" style={{ color: '#D4A43C' }}>
                    {rune.name}
                    {rune.runeTier !== undefined && (
                      <span class="bone-dim ml-1">T{rune.runeTier}</span>
                    )}
                  </span>
                </div>
              )}
            </For>
          </div>
        </div>
      )}

      {/* Gear Section */}
      {gear().length > 0 && (
        <div>
          <div class="bone-dim text-xs uppercase tracking-wider mb-2">Equipment</div>
          <div class="space-y-1 max-h-64 overflow-y-auto">
            <For each={gear()}>
              {(item) => {
                const color = getItemColor(item);
                const statLabel = () => {
                  if (item.damage) return `${item.damage.min}–${item.damage.max} dmg`;
                  if (item.defense) return `${item.defense} def`;
                  return '';
                };
                return (
                  <div class="flex justify-between items-center px-2 py-1 bg-obsidian hover:bg-panel transition-colors cursor-default border-l-2"
                    style={{ 'border-left-color': color }}>
                    <div>
                      <span class="text-sm font-medium" style={{ color }}>
                        {item.name}
                      </span>
                      {statLabel() && (
                        <span class="bone-dim text-xs ml-2">{statLabel()}</span>
                      )}
                      {item.isSocketed && (
                        <span class="text-xs" style={{ color: '#8a8a5a' }}>[SOCKETED]</span>
                      )}
                    </div>
                    <div class="flex gap-1">
                      {/* Socket button (only if sockets available and not a rune) */}
                      {item.runeSockets !== undefined && item.runeSockets > 0 && !item.isSocketed && (
                        <button
                          class="text-xs px-1.5 py-0.5 bg-panel border border-setGreen text-setGreen hover:bg-setGreen/30 transition-colors"
                          onClick={() => {
                            const firstRune = runes()[0];
                            if (firstRune) socketItem(item.id, firstRune.id);
                          }}
                        >
                          Socket
                        </button>
                      )}
                      {/* Equip button (non-rune gear only) */}
                      {item.type !== 'rune' && item.type !== 'helm' && (
                        <button
                          class="text-xs px-1.5 py-0.5 bg-blood-red/20 border border-blood-red/50 text-blood-red hover:bg-blood-red/40 transition-colors"
                          onClick={() => equipItem(item.id)}
                        >
                          Equip
                        </button>
                      )}
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
      )}

      {/* Empty State */}
      {gameState.inventory.length === 0 && (
        <div class="bone-dim text-sm italic text-center py-8">
          No loot yet. The darkness yields nothing... for now.
        </div>
      )}
    </div>
  );
};

export default LootLog;
