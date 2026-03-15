# Rakanishu: The Gothic-Solid Standard

## [1. SOLIDJS REACTIVITY & LOGIC]
- **NO DESTRUCTURING:** Never destructure props or stores (e.g., `const {hp} = state` is BANNED). Access directly: `state.state.player.hp`.
- **MANDATORY BATCHING:** Every update inside a `setInterval` or `createEffect` MUST be wrapped in `batch(() => { ... })`.
- **PATH ACCURACY:** Our context structure is `{ state, setState }`. Always access via `state.state`.
- **ARRAY ITERATION:** Whirlwind is AoE. Use a `for` loop to iterate over `state.state.enemies`. NEVER use hardcoded indexes.

## [2. GRIMDARK DESIGN SYSTEM]
- **NO DEFAULT COLORS:** Ban all standard Tailwind grays/colors (e.g., bg-gray-800, text-white).
- **HEX ONLY:** 
  - Background: `bg-[#0a0a0a]` | Panels: `bg-[#1a1a1a]`
  - Health/Blood: `bg-[#8a0000]` | Gold/Uniques: `text-[#ffd700]`
  - Standard Text: `text-[#d1d1d1]` | Muted Labels: `text-[#6b6b6b]`
- **WIDTHS:** Use fractions (`w-1/5`) or arbitrary (`w-[30%]`). NEVER use percentage strings like `w-20%`.

## [3. GAME MECHANICS & PERFORMANCE]
- **TICKS:** Use 100ms intervals in `onMount` and clear in `onCleanup`.
- **CALCULATION SAFETY:** Use `Math.max(0, ...)` for HP and `Math.floor()` for all damage/gold math.
- **RESPAWN:** If an enemy `isDead`, decrement `respawnTimer`. At 0, reset `hp` to `maxHp` and `isDead: false`.

## [4. HOOK ARCHITECTURE & LIFECYCLES]
- **NO JSX IN HOOKS:** Custom hooks (e.g., `useCombatLoop`) are logic-only. NEVER return `null` or JSX; return `void`, an object of data, or nothing at all.
- **CLEANUP INTEGRITY:** When using `setInterval` or `setTimeout`, always assign it to a local variable (e.g., `const interval = ...`) and clear it IMMEDIATELY in `onCleanup` to avoid memory leaks.
- **IDENTIFIER ACCURACY:** 
  - Our context setter is `setState`, not `setStore`.
  - Our data path is ALWAYS `state.state.property`.