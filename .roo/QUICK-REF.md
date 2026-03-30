# ⚡ Rakanishu Quick Ref

## REACTIVITY
- **NO DESTRUCTURING**: Access `props.item` or `state.player`. NEVER `{item}`.
- **SETTERS**: Use path-based `setState("player", "hp", n)`.
- **FLOW**: Use `<For>` and `<Show>`, never `.map()` or ternaries.

## VISUALS
- **COLORS**: Hex only: `#0a0a0a` (BG), `#1a1a1a` (Panel), `#8a0000` (Blood), `#ffd700` (Unique).
- **LAYOUT**: `h-screen overflow-hidden`. 3-column flex.

## LOGIC
- **LOOPS**: Wrap in `batch()`. Clear in `onCleanup()`.
- **MATH**: `Math.max(0, ...)` for safety. `Math.floor()` for damage.