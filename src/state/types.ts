/**
 * Core Game State Type Definitions
 * Uses break_infinity.js Decimal for all numerical stat values.
 * Mage Studios Law: Single source of truth for item interfaces.
 */
import Decimal from 'break_infinity.js';

/** Spatial dimensions for inventory grid placement */
export interface ItemDimensions {
  w: number;
  h: number;
}

/** Core Item interface — all numerical stats use Decimals */
export interface Item {
  id: string;
  name: string;
  rarity: 'Normal' | 'Magic' | 'Rare' | 'Unique';
  stats: Record<string, Decimal>;
  spatialIndex: number;
  type?: 'weapon' | 'armor' | 'shield' | 'helm' | 'rune';
  quality?: 'low' | 'normal' | 'magic' | 'rare' | 'set' | 'unique' | 'crafted';
  damageMin?: Decimal;
  damageMax?: Decimal;
  defense?: Decimal;
  weight?: Decimal;
  dimensions?: ItemDimensions;
  isSocketed?: boolean;
  runeSockets?: number;
  isEquipped?: boolean;
}
