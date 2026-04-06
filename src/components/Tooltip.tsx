/* @refresh reload */
/**
 * Tooltip Component — Gothic item tooltip with Obsidian background
 * and rarity-coded borders. Reads directly from gameState store.
 * Mage Studios Law: NO DESTRUCTURING of props or state.
 */
import { Component, createEffect, createSignal } from 'solid-js';
import { gameState } from '../state/gameState';
import type { InventoryEntry } from '../state/gameState';

const COLORS = {
  obsidian: '#0a0a0a',
  panel: '#1a1a1a',
  bone: '#e2dac2',
  stone: '#6b7280',
  bloodRed: '#8a0000',
  holyGold: '#D4AF37',
  gray: '#696969',
  magic: '#4b69ff',
  unique: '#908858',
};

function getBorderColor(item: InventoryEntry | null): string {
  if (!item) return COLORS.obsidian;
  const q = item.quality || 'normal';
  if (q === 'rare') return COLORS.bloodRed;
  if (q === 'unique' || q === 'set') return COLORS.holyGold;
  if (q === 'magic') return COLORS.magic;
  if (q === 'low') return COLORS.gray;
  return COLORS.stone;
}

interface TooltipProps {
  itemId: string | null;
  x: number;
  y: number;
}

const Tooltip: Component<TooltipProps> = (props) => {
  const [visible, setVisible] = createSignal(false);

  createEffect(() => {
    setVisible(props.itemId !== null);
  });

  const item = () => {
    if (!props.itemId) return null;
    // Direct path access — no destructuring of gameState
    return gameState.inventory.find((i: InventoryEntry) => i.id === props.itemId) || null;
  };

  function getItemName(entry: InventoryEntry): string {
    // Direct path access to quality — no destructuring
    const prefix = entry.isSuperior ? 'Superior ' : '';
    return prefix + entry.name;
  }

  function formatStatLabel(entry: InventoryEntry): string {
    // Direct path access — no destructuring
    const parts: string[] = [];
    if (entry.damage) {
      parts.push(`${entry.damage.min}–${entry.damage.max} Damage`);
    }
    if (entry.defense !== undefined) {
      parts.push(`${entry.defense} Defense`);
    }
    if (entry.runeSockets && entry.runeSockets > 0) {
      parts.push(`Socketed (${entry.runeSockets})`);
    }
    return parts.join('\n');
  }

  return (
    <div
      class="absolute pointer-events-none z-50"
      style={{
        display: visible() ? 'block' : 'none',
        left: `${props.x + 12}px`,
        top: `${props.y - 8}px`,
        'min-width': '200px',
        'max-width': '280px',
        padding: '10px 12px',
        background: COLORS.obsidian,
        border: `1px solid ${getBorderColor(item()!)}`,
        'border-radius': '2px',
        'box-shadow': '0 0 8px rgba(0, 0, 0, 0.8)',
        'font-family': 'monospace',
        'font-size': '0.75rem',
        color: COLORS.bone,
      }}
    >
      {item() && (
        <div>
          <div
            style={{
              'font-size': '0.85rem',
              'font-weight': 'bold',
              'margin-bottom': '6px',
              color: getBorderColor(item()!),
              'border-bottom': `1px solid ${getBorderColor(item()!)}33`,
              'padding-bottom': '4px',
            }}
          >
            {getItemName(item()!)}
          </div>
          <div style={{ 'white-space': 'pre-line', color: COLORS.bone, 'line-height': '1.5' }}>
            {formatStatLabel(item()!)}
          </div>
          {item()?.quality && (
            <div style={{ 'margin-top': '6px', 'font-size': '0.65rem', color: COLORS.stone, 'text-transform': 'uppercase', 'letter-spacing': '0.05em' }}>
              {item()!.quality}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
