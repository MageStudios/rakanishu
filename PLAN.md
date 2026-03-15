# Rakanishu: Project Plan & Memory Bank

## 1. Core Architectural Truths (DO NOT DEVIATE)
- **Tech Stack:** SolidJS + Tailwind CSS.
- **State Pathing:** Global state is nested. Access: `useGameContext().state.player`.
- **Reactivity:** NO DESTRUCTURING of props or stores. Use `batch(() => { ... })` for all loop updates.
- **Game Tick:** 100ms interval in `onMount`, cleared in `onCleanup`.

## 2. The Gothic Design System (Hex Only)
- **Background:** `#0a0a0a` | **Panels:** `#1a1a1a` | **Borders:** `#2a2a2a`
- **Health/Blood:** `#8a0000` | **Gold/Uniques:** `#ffd700`
- **Standard Text:** `#d1d1d1` | **Muted Labels:** `#6b6b6b`

## 3. Current Status & Next Steps
- **Completed:** GameContext (Store + LocalStorage sync), Main HUD Layout (3-Column).
- **In Progress:** Combat Engine (`useCombatLoop.ts`).
- **Next Task:** Implement **Loot Drop System** (20% Potion, 5% Mace) and **Enemy Respawn** logic.
