# SolidJS Game Architecture Rules (Rakanishu-v2)

You are a Senior Game Architect refactoring a Diablo-style idle game. 
Follow these strict rules for all code generation to maintain "Clean Room" integrity:

## 1. UI Framework: Tailwind CSS ONLY
- **NO BOOTSTRAP:** DO NOT use Bootstrap, jQuery, or external CSS files.
- **UTILITY FIRST:** Use utility classes for everything (e.g., `flex`, `grid`, `bg-black`).
- **AESTHETIC:** Maintain a "Grimdark" aesthetic: `#050505` backgrounds, `#8a0000` health, `#ffd700` gold.
- **LAYOUT:** MUST be a 3-column `h-screen overflow-hidden` dashboard. Use `overflow-y-auto` only on the specific columns that need scrolling (like the Loot Log).

## 2. State Management: SolidJS Stores
- **NO DIRECT MUTATION:** Never use `obj.prop = value`. ALWAYS use path-based setters: `setStore("player", "hp", (h) => h - 10)`.
- **EXPORTS:** ALWAYS export both `[state, setState]` from store files.
- **RECONCILE:** Use `reconcile` from `solid-js/store` when loading data from LocalStorage to preserve reactivity in nested arrays/objects.
- **ACCESS:** NEVER call the store like a function (e.g., use `state.player` NOT `state().player`).

## 3. Game Loop Logic: Whirlwind & Combat
- **WHIRLWIND AOE:** Combat MUST iterate over the `enemies` array in the store and apply damage to all active targets (`hp > 0`) simultaneously.
- **PERFORMANCE:** Use `batch(() => { ... })` inside the loop to ensure only one DOM update happens per "tick," regardless of how many enemies are hit.
- **FIXED TIMESTEP:** Use a `100ms` interval for the combat loop to ensure consistent game speed.

## 4. Assistant System (Utility vs. Hireling)
- **SLOT INDEPENDENCE:** "Permanent Assistants" (Auto-sellers, Potion-givers) ARE NOT Hirelings. They DO NOT use any of the 3 `hirelings` slots.
- **PASSIVE TRIGGERS:** Check for Assistant flags/settings inside the `handleDeath` or `combatLoop` functions to trigger automation (e.g., auto-selling normal items for gold).

## 5. Persistence & Versioning
- **AUTO-SAVE:** Use `createEffect` to track store changes and sync to `localStorage` automatically.
- **SERIALIZATION:** Store Dates as ISO strings in JSON and convert back to `Date` objects during hydration if necessary.
- **VERSIONING:** All save data must include a `version` number for future migration logic.
