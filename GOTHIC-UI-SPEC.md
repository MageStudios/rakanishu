# Gothic UI Specification

## Visual Identity
- **Theme**: Dark, atmospheric, gothic
- **Layout**: 3-Column System (Left 25% | Center 50% | Right 25%)
- **Palette**:
  - Obsidian: `#0a0a0a` (background)
  - Panels: `#1a1a1a` (panel backgrounds)
  - Blood-Red: `#8a0000` (accents, highlights)
  - Bone: `#e2dac2` (text, borders)

## Code Restrictions
- No default Tailwind grays (`gray-*`)
- No `text-white`
- No percentage width strings (use fractions like `w-1/4`, `w-1/2`)
- Use module-level stores only, no Context Providers
- Never destructure props/state (SolidJS reactivity break)
- `createSignal` forbidden for game state (only local UI toggles)
- Use path-based setters: `setGameState("player", "hp", 100)`

## Spatial Law
- Inventory is a 10×4 grid
- Index = `y * 10 + x`
- Bounds check: `(x+w ≤ 10, y+h ≤ 4)` plus cell occupancy
- Items that don't fit go to `gameState.ground`
- Paper doll: fixed dimensions and type gates

## PRNG Law
- Use xoshiro256** (BigInt 64-bit) exclusively
- No `Math.random()` anywhere
- State is 4-element `BigUint64Array`
- Advance on every roll (no stuck state)
