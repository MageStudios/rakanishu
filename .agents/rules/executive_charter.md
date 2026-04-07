---
trigger: always_on
---

---
description: "Rakanishu technical constraints: SolidJS reactivity and spatial logic."
---

# SolidJS Reactivity (The Law)
- **NO DESTRUCTURING**: Never destructure 'props' or 'state' (Instantly breaks Solid reactivity).
- **SIGNAL PURGE**: `createSignal` is FORBIDDEN for game state. Use only for local UI toggles.
- **SETTERS**: Use path-based setters: `setGameState("player", "hp", 100)`.
- **HMR**: Entry points (src/index.tsx, src/App.tsx) MUST start with `/* @refresh reload */`.

# Project Routing (See CLAUDE.md)
- For Truncation/Memory: Reference `docs/ops/context.md`.
- For Scaling/Bestiary: Reference `docs/features/scaling.md`.
- For Visual Identity: Reference `docs/style/palette.md`.

# Spatial & Inventory Laws
- **GRID**: Inventory is a strictly enforced 10×4 grid. Index = `y * 10 + x`.
- **BOUNDS**: `canPlace` check: `(x+w ≤ 10, y+h ≤ 4)`.
- **DIMENSIONS**: Every `InventoryEntry` MUST have `w: number` and `h: number`.