/* @refresh reload */
/**
 * spatialInventory.ts — D2LoD Authentic Spatial Inventory Engine
 *
 * Supports two grid sizes:
 *   • Player Inventory: 10×4  (40 cells)
 *   • Stash (PlugY pages): 10×10 (100 cells)
 *
 * Each item carries implicit dimensions: w=1, h=1 (1×1 cell).
 * `canPlace` performs bounds + overlap checks against the provided grid shape.
 * Items that cannot fit are pushed to `ground[]`.
 *
 * Coordinate system:  grid_index = y * cols + x   (row-major)
 */

import type { InventoryEntry } from '../state/gameState';

// ─── Grid Dimension Presets ───
export const PLAYER_GRID = { cols: 10, rows: 4 } as const;    // 40 cells
export const STASH_GRID  = { cols: 10, rows: 10 } as const;   // 100 cells

export type GridSize = typeof PLAYER_GRID | typeof STASH_GRID;

// ─── Core Types ───
export type CellId = string | null;
export type Grid = CellId[];

export interface GridPlacement {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SpatialInventory {
  grid: Grid;                             // flat cell array (null | item id)
  placements: Map<string, GridPlacement>; // itemId → {x, y, w, h}
  ground: InventoryEntry[];               // overflow items
  size: GridSize;                         // grid shape reference
}

export interface GroundDrop {
  item: InventoryEntry;
  reason: 'too_big' | 'no_space';
}

// ─── Factory ───
/** Create a fresh spatial inventory for the given grid size. */
export function createSpatialInventory(size: GridSize = PLAYER_GRID): SpatialInventory {
  return {
    grid: new Array(size.cols * size.rows).fill(null),
    placements: new Map(),
    ground: [],
    size,
  };
}

// ─── Bounds & Overlap Check ───
/**
 * Returns true when a rectangle (x, y, w, h) fits entirely within the
 * grid bounds **and** every cell it covers is currently `null`.
 */
export function canPlace(
  grid: Grid,
  cols: number,
  rows: number,
  x: number,
  y: number,
  w: number,
  h: number,
): boolean {
  // ── bounds ──
  if (x < 0 || y < 0 || x + w > cols || y + h > rows) return false;

  // ── overlap ──
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      if (grid[(y + row) * cols + (x + col)] !== null) return false;
    }
  }
  return true;
}

// ─── Fit Finder ───
/**
 * Top-left → bottom-right scan. Returns the first (x, y) where the
 * item fits, or `null` when the grid is completely blocked.
 */
export function findPlacement(
  grid: Grid,
  cols: number,
  rows: number,
  w: number,
  h: number,
): { x: number; y: number } | null {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (canPlace(grid, cols, rows, x, y, w, h)) return { x, y };
    }
  }
  return null;
}

// ─── Placement ───
/**
 * Place `item` into `spatial`. If `preferred` is valid it is used;
 * otherwise `findPlacement` is called. Returns `null` on success or a
 * `GroundDrop` when the item overflows.
 */
export function placeItem(
  spatial: SpatialInventory,
  item: InventoryEntry,
  preferred?: { x: number; y: number },
): GroundDrop | null {
  const w = item.w ?? 1;
  const h = item.h ?? 1;
  const { cols, rows } = spatial.size;

  if (w > cols || h > rows) return { item, reason: 'too_big' };

  let pos: { x: number; y: number } | null = null;

  if (preferred && canPlace(spatial.grid, cols, rows, preferred.x, preferred.y, w, h)) {
    pos = preferred;
  }

  if (!pos) pos = findPlacement(spatial.grid, cols, rows, w, h);
  if (!pos) return { item, reason: 'no_space' };

  // ── Occupy cells ──
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      spatial.grid[(pos.y + row) * cols + (pos.x + col)] = item.id;
    }
  }

  spatial.placements.set(item.id, { id: item.id, x: pos.x, y: pos.y, w, h });
  return null;
}

// ─── Removal ───
export function removeItem(spatial: SpatialInventory, itemId: string): InventoryEntry | null {
  const placement = spatial.placements.get(itemId);
  if (!placement) return null;

  const { cols } = spatial.size;
  for (let row = 0; row < placement.h; row++) {
    for (let col = 0; col < placement.w; col++) {
      spatial.grid[(placement.y + row) * cols + (placement.x + col)] = null;
    }
  }

  spatial.placements.delete(itemId);

  const idx = spatial.ground.findIndex(i => i.id === itemId);
  return idx >= 0 ? spatial.ground.splice(idx, 1)[0] : null;
}

// ─── Queries ───
/** Return the placement for the item under (x, y), or null. */
export function getItemAt(
  spatial: SpatialInventory,
  x: number,
  y: number,
): GridPlacement | null {
  const { cols, rows } = spatial.size;
  if (x < 0 || y < 0 || x >= cols || y >= rows) return null;

  const itemId = spatial.grid[y * cols + x];
  if (!itemId) return null;
  return spatial.placements.get(itemId) ?? null;
}

/** All items currently placed on the grid. */
export function getGridItems(spatial: SpatialInventory): GridPlacement[] {
  return Array.from(spatial.placements.values());
}

/** Whether the grid is completely empty. */
export function isEmpty(spatial: SpatialInventory): boolean {
  return spatial.placements.size === 0;
}

// ─── Convenience Add ───
export function addItem(spatial: SpatialInventory, item: InventoryEntry): void {
  const drop = placeItem(spatial, item);
  if (drop) spatial.ground.push(item);
}

// ─── Bulk Operations (useful for stash serialization) ───

/** Serialize only the placed items (rebuildable). */
export function serializePlaced(spatial: SpatialInventory): GridPlacement[] {
  return getGridItems(spatial);
}

/** Re-build a spatial inventory from a placement list and a source item map. */
export function rebuildFromPlacements(
  size: GridSize,
  placements: GridPlacement[],
  itemSource: Record<string, InventoryEntry>,
): SpatialInventory {
  const inv = createSpatialInventory(size);
  for (const p of placements) {
    const item = itemSource[p.id];
    if (!item) continue; // orphan — skip
    for (let row = 0; row < p.h; row++) {
      for (let col = 0; col < p.w; col++) {
        inv.grid[(p.y + row) * size.cols + (p.x + col)] = item.id;
      }
    }
    inv.placements.set(p.id, p);
  }
  return inv;
}
