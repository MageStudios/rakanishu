# AGENTS.md - Project Rakanishu (SolidJS)

## 🎯 High-Level Vision
A high-performance SolidJS application with a **Gothic UI** aesthetic.
Focus: Modularity, fine-grained reactivity, and 2026 best practices.

## 🤖 The Mode & Model Specialized Workflow
Each mode is optimized for 8-bit local inference via LM Studio JIT swap.

1. **🪃 Orchestrator (Qwen3.5-4B):** - ROLE: Strategic lead. Manages Git, @PLAN.md, and @PROGRESS.md.
   - RULE: BANNED from code editing. Must delegate to Architect/Stylist.
2. **⚔️ Architect (Qwen2.5-7B):** - ROLE: Senior SolidJS dev. Logic, signals, and API integration.
   - RULE: Must follow "No Prop Destructuring" to preserve reactivity.
3. **🎨 Stylist (Llama-3.1-8B):** - ROLE: UI/UX Expert. Tailwind, animations, and Gothic theme.
   - RULE: All colors must strictly match the Gothic Palette defined below.
4. **🔍 Reviewer (DeepSeek-V2-Lite):** - ROLE: Skeptical Auditor.
   - RULE: Read-only. Find bugs, logic leaks, and rule violations.

## ⚛️ SolidJS Critical Rules
- **NO PROP DESTRUCTURING:** Use `props.item`, never `const { item } = props`.
- **REACTIVE SCOPE:** Keep logic inside `createMemo` or `createEffect` to avoid stale closures.
- **CONTROL FLOW:** Use `<Show>`, `<For>`, and `<Index>`.

## 🎨 Gothic UI Design Palette
- **Obsidian (BG):** #0a0a0c
- **Blood Red (Accent):** #4a0404
- **Iron Gray:** #1a1a1a
- **Fonts:** Serif for headers, Monospace for code/data.

## 📂 Architecture Save Points
- **@PLAN.md:** The source of truth for the *current* task.
- **@PROGRESS.md:** Log of completed steps.
- **.kilocode/rules/:** Mode-specific system instructions.

## Tool Usage Protocols
- **Always prefer `write_to_file` over `edit_file`** for files under 300 lines.
- **Why**: Prevents "No match found" and "Empty old_string" errors common with local model inference.
- **Standard**: If a file exists, the Architect should read it first, then use `write_to_file` to provide the updated version in full.

## File Templates & Boilerplate
- **SolidJS Entry Point (`src/index.tsx`)**:
- MUST always start with `/* @refresh reload */` as the very first line.
- RATIONALE: Required for reliable Hot Module Replacement (HMR) in the Rakanishu OS environment.
- DO NOT remove this comment during refactors or overwrites.

## State Management Rules
- **Framework:** SolidJS with `solid-js/store`.
- **Constraint:** NEVER use `createSignal` for the global `gameState`.
- **Constraint:** ALWAYS use `createStore<GameState>` to avoid "never" type inference.
- **Syntax:** - Access state as an object: `gameState.player` (NOT `gameState().player`).
    - Update state using path strings: `setGameState('inventory', (inv) => [...inv, item])`.
    
## Game Philosophy: NO CLICKING
- This is a SYSTEM-DRIVEN incremental, not a clicker.
- All combat and resource gathering must be handled via the `gameLoop.ts` ticker.
- Interaction should be limited to: Gear management, Skill tree allocation, and Menu navigation.
- If a task involves "Player clicks to [do thing]", REJECT IT and implement a passive system instead.