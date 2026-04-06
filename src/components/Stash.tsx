/* @refresh reload */
/**
 * Stash Component — D2-style 10×10 grid with page navigation
 *
 * Renders StashPage[] from gameState.stashPages.
 * Each page is a 10×10 spatial grid. Players can flip between up to 4 pages.
 */
import { Component, For, createSignal } from 'solid-js';
import { gameState } from '../state/gameState';

const MAX_PAGES = 4;
const COLS = 10;
const CELL_SIZE = 36; // px per cell

const Stash: Component = () => {
  const [currentPage, setCurrentPage] = createSignal(0);

  // How many pages actually exist (at least 1 for display)
  const pageCount = () => Math.max(1, gameState.stashPages.length);

  const pageData = () => {
    const idx = currentPage();
    if (idx < gameState.stashPages.length) {
      return gameState.stashPages[idx];
    }
    return null;
  };

  // Build a visual 2D array from spatial placements
  const gridCells = (): (string | null)[][] => {
    const empty: (string | null)[][] = Array.from({ length: 10 }, () =>
      Array(10).fill(null)
    );
    const page = pageData();
    if (!page || !page.spatial.placements) return empty;

    for (const [itemId, placement] of page.spatial.placements) {
      for (let dx = 0; dx < placement.w; dx++) {
        for (let dy = 0; dy < placement.h; dy++) {
          const x = placement.x + dx;
          const y = placement.y + dy;
          if (y < 10 && x < 10) {
            empty[y][x] = itemId;
          }
        }
      }
    }
    return empty;
  };

  const cells = () => {
    const grid = gridCells();
    const flat: (string | null)[] = [];
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        flat.push(grid[y]?.[x] ?? null);
      }
    }
    return flat;
  };

  // Determine if a cell is the origin (top-left) of an item
  const isItemOrigin = (idx: number): boolean => {
    const page = pageData();
    if (!page || !page.spatial.placements) return false;
    const val = cells()[idx];
    if (!val) return false;
    const x = idx % COLS;
    const y = Math.floor(idx / COLS);
    const p = page.spatial.placements.get(val);
    return p ? (p.x === x && p.y === y) : true;
  };

  // Get the item name for origin cells
  const itemNameAt = (idx: number): string | null => {
    if (!isItemOrigin(idx)) return null;
    const val = cells()[idx];
    if (!val) return null;
    const page = pageData();
    // Try finding the entry name in ground or from placement data
    const placement = page?.spatial.placements.get(val);
    // Derive a display name from the item id
    return val?.replace(/_(stash|inv|loot|offline)_.*$/, '').replace(/_/g, ' ') ?? null;
  };

  // Cell styling based on occupancy
  const cellClass = (idx: number): string => {
    const hasItem = cells()[idx] !== null;
    const origin = isItemOrigin(idx);
    if (origin) return 'bg-bone/20 border border-bone/30 text-bone text-xs flex items-center justify-center';
    if (hasItem) return 'bg-bone/10 border border-bone/20';
    return 'bg-obsidian border border-stone-700/30 hover:border-stone-500/50';
  };

  return (
    <div class="panel">
      <h2 class="text-bone text-xl mb-4 flex justify-between items-center">
        <span>Stash</span>
        <span class="text-xs text-stone-500">Page {currentPage() + 1}/{pageCount()}</span>
      </h2>

      {/* 10×10 Grid */}
      <div
        class="grid gap-0 mx-auto border border-stone-700/50 bg-obsidian select-none"
        style={`grid-template-columns: repeat(${COLS}, ${CELL_SIZE}px); grid-template-rows: repeat(10, ${CELL_SIZE}px);`}
      >
        <For each={cells()}>
          {(_, idx) => (
            <div
              class={cellClass(idx())}
              style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
              title={itemNameAt(idx()) ?? ''}
            >
              {itemNameAt(idx()) ? (
                <span class="truncate px-0.5">{itemNameAt(idx())}</span>
              ) : null}
            </div>
          )}
        </For>
      </div>

      {/* Page Navigation */}
      <div class="flex justify-center gap-2 mt-3">
        <button
          class={`px-3 py-1 border text-xs transition-colors ${
            currentPage() === 0
              ? 'border-blood-red text-blood-red bg-blood-red/10'
              : 'border-stone-700 text-stone-500 hover:text-bone hover:border-stone-500'
          }`}
          disabled={currentPage() === 0}
          onClick={() => setCurrentPage(0)}
        >
          «
        </button>
        <For each={Array.from({ length: MAX_PAGES }, (_, i) => i)}>
          {(p) => (
            <button
              class={`w-8 h-8 border text-xs transition-colors ${
                currentPage() === p
                  ? 'border-blood-red text-blood-red bg-blood-red/10 font-bold'
                  : p < pageCount()
                    ? 'border-stone-700 text-stone-400 hover:text-bone hover:border-stone-500'
                    : 'border-stone-800 text-stone-700 cursor-not-allowed'
              }`}
              disabled={p >= pageCount()}
              onClick={() => setCurrentPage(p)}
            >
              {p + 1}
            </button>
          )}
        </For>
        <button
          class={`px-3 py-1 border text-xs transition-colors ${
            currentPage() === pageCount() - 1
              ? 'border-blood-red text-blood-red bg-blood-red/10'
              : 'border-stone-700 text-stone-500 hover:text-bone hover:border-stone-500'
          }`}
          disabled={currentPage() === pageCount() - 1}
          onClick={() => setCurrentPage(pageCount() - 1)}
        >
          »
        </button>
      </div>

      {/* Overflow */}
      {gameState.stashOverflow.length > 0 && (
        <div class="mt-3 text-xs text-orange-400 text-center">
          ⚠ {gameState.stashOverflow.length} item{gameState.stashOverflow.length > 1 ? 's' : ''} in overflow (no space)
        </div>
      )}
    </div>
  );
};

export default Stash;
