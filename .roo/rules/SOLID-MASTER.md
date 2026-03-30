# ⚔️ Rakanishu Master Standard

## 1. REACTIVITY & STATE
- **NO DESTRUCTURING**: Never destructure `props` or `state`.
- **MODULE STORES**: Use `src/gameState.ts` as the singular source of truth.
- **SETTERS**: Use path-based setters: `setState("player", "hp", 100)`.
- **BATCHING**: Wrap all loop updates in `batch(() => { ... })`.

## 2. GOTHIC UI SPEC
- **3-COLUMN LAYOUT**: Left (25%), Center (50%), Right (25%).
- **HEX COLORS ONLY**: 
  - Bg: `#0a0a0a` | Panels: `#1a1a1a` | Borders: `#2a2a2a`.
  - Blood: `#8a0000` | Gold/Uniques: `#ffd700`.
  - Text: `#d1d1d1` | Muted: `#6b6b6b`.
- **BANNED**: No default Tailwind grays, `text-white`, or percentage strings like `w-20%`.

## 3. PERFORMANCE & LOOP
- **TICKS**: 100ms intervals in `onMount`; MUST clear in `onCleanup`.
- **MATH**: Use `Math.max(0, ...)` for HP and `Math.floor()` for damage.