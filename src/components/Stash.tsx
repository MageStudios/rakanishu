/* @refresh reload */
/**
 * Stash — D2-style 10×10 spatial grid with page navigation
 */
import { Component, For, createSignal } from 'solid-js';
import { gameState } from '../state/gameState';

const MAX_PAGES = 4;
const COLS = 10;
const CELL_SIZE = 36;

const Stash: Component = () => {
  const [currentPage, setCurrentPage] = createSignal(0);

  const pageCount = () => Math.max(1, gameState.stashPages.length);

  const pageData = () => {
    const idx = currentPage();
    if (idx < gameState.stashPages.length) return gameState.stashPages[idx];
    return null;
  };

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
          if (y < 10 && x < 10) empty[y][x] = itemId;
        }
      }
    }
    return empty;
  };

  const cells = () => {
    const grid = gridCells();
    const flat: (string | null)[] = [];
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) flat.push(grid[y]?.[x] ?? null);
    }
    return flat;
  };

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

  const itemNameAt = (idx: number): string | null => {
    if (!isItemOrigin(idx)) return null;
    const val = cells()[idx];
    if (!val) return null;
    return val.replace(/_(stash|inv|loot|offline)_.*$/, '').replace(/_/g, ' ') ?? null;
  };

  const cellClass = (idx: number): string => {
    const hasItem = cells()[idx] !== null;
    const origin = isItemOrigin(idx);
    if (origin) return 'bg-bone/20 border border-bone/30 text-bone text-xs flex items-center justify-center';
    if (hasItem) return 'bg-bone/10 border border-bone/20';
    return 'bg-obsidian border border-bone/10 hover:border-bone/30';
  };

  return (
    <div class="panel">
      <h2 class="text-bone text-xl mb-4 flex justify-between items-center">
        <span>Stash</span>
        <span class="text-xs bone-dim">Page {currentPage() + 1}/{pageCount()}</span>
      </h2>

      <div
        class="grid gap-0 mx-auto border border-blood-red bg-obsidian select-none"
        style={`grid-template-columns: repeat(${COLS}, ${CELL_SIZE}px); grid-template-rows: repeat(10, ${CELL_SIZE}px);`}
      >
        <For each={cells()}>
          {(_, idx) => (
            <div
              class={cellClass(idx())}
              style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
              title={itemNameAt(idx()) ?? ''}
            >
              {itemNameAt(idx()) && (
                <span class="truncate px-0.5">{itemNameAt(idx())}</span>
              )}
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
              : 'border-bone/20 bone-dim hover:text-bone hover:border-bone/40'
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
                    ? 'border-bone/20 bone-dim hover:text-bone hover:border-bone/40'
                    : 'border-obsidian bone-dim cursor-not-allowed'
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
              : 'border-bone/20 bone-dim hover:text-bone hover:border-bone/40'
          }`}
          disabled={currentPage() === pageCount() - 1}
          onClick={() => setCurrentPage(pageCount() - 1)}
        >
          »
        </button>
      </div>

      {/* Overflow Warning */}
      {gameState.stashOverflow.length > 0 && (
        <div class="mt-3 text-xs text-center" style="color:#D4A43C">
          ⚠ {gameState.stashOverflow.length} item{gameState.stashOverflow.length > 1 ? 's' : ''} in overflow
        </div>
      )}
    </div>
  );
};

export default Stash;
