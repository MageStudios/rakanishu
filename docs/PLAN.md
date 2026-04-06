# Rakanishu — Development Roadmap

## Current State
- **10x4 Grid**: Spatial inventory system fully implemented with `canPlace` bounds checking and cell occupancy. Items that don't fit go to `gameState.ground`.
- **Combat Tickers**: Amazon (5.7s) and Paladin (5.0s) animated progress bars, fully reactive and type-safe. Progress driven by `raf` loops, durations sourced from `gameState.combat.{amazon,paladin}.durationSec`.
- **PRNG**: xoshiro256** (BigInt 64-bit) enforced across all loot RNG. `Math.random()` purged.
- **State Architecture**: Module-level store only. SolidJS `createStore` with path-based setters. No destructuring, no `createSignal` for game state.
- **Git**: SSH remote verified (`git@github.com:MageStudios/rakanishu.git`).
- **Build**: TypeScript clean, Vite dev server green.

## Next Sprint: Item Tooltips & Loot-Driven Inventory
- **Goal**: Implement hover/click item tooltips populated with real metadata from `affixes.ts`, `bases.ts`, and `lootSystem.ts`.
- **Tasks**:
  1. Create `src/components/ItemTooltip.tsx` — reads an `InventoryEntry` and renders name, quality, affixes, damage/armor stats, spatial dimensions.
  2. Wire spatial drops: connect `lootSystem.rollLoot()` → `inventorySpatial` grid placement. Verify `canPlace`/ground fallback.
  3. Tooltip trigger: `onmouseenter`/`onmouseleave` on grid cell items. No signal restructuring — use a single UI toggle signal.
  4. Visual polish: Gothic palette (Obsidian bg, Bone text, Blood-Red/Bone/Gold quality colors).
- **Acceptance Criteria**: All dropped items show correct affixes, quality color, and dimensions on hover. Grid placements are deterministic (PRNG-seeded and advancing).

## Dev Notes
- **SSH Remote**: Always verified. No HTTPS prompts.
- **M1 Pro / 16GB RAM**: Keep `--max-old-space-size=4096` for vitest.
- **HMR Boilerplate**: All entry points MUST start with `/* @refresh reload */`.
- **No Destructuring**: Solid reactivity breaks on prop/state destructuring. Always access via dot notation or path setters.
