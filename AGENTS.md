# AGENTS.md (SolidJS Repository Standard)

Scope: entire repository.

## Repository Intent

Treat this repository as SolidJS-first. Prefer creating or updating SolidJS skills, references, guides, and tooling over generic AI meta-guidance.

## Operating Priorities

1. Preserve SolidJS reactivity correctness.
2. Optimize readability and maintainability before micro-optimization.
3. Favor deterministic workflows and checklists in skills.
4. Keep `SKILL.md` concise; move detailed knowledge into `references/`.
5. Always defer to specific rule files in /.continue/rules/ for implementation details (e.g., solid-context.md).

## SolidJS Coding and Design Standards

- Prefer fine-grained reactivity primitives intentionally (`createSignal`, `createMemo`, `createEffect`, `createResource`, `batch`, `untrack`).
- Avoid unnecessary effects when derivation is sufficient.
- Keep side effects explicit and isolated.
- Use Solid control flow primitives (`<Show>`, `<For>`, `<Switch>`, `<Match>`) for clarity and performance.
- Design props and component boundaries to minimize hidden coupling.
- Account for hydration/SSR behavior in guidance and review criteria.

## Skill Authoring Standards

When adding or updating a SolidJS skill:

1. Use clear trigger language in frontmatter `description` (when to use).
2. Include deterministic workflow steps with acceptance checks.
3. Define failure modes and fallback paths.
4. Link to only relevant reference files.
5. Include output format expectations (checklists, plans, patches, review notes).
6. Require citation-backed claims using normalized corpus `doc_id` values.

## Required Review Checklist for SolidJS Artifacts

- Reactivity correctness verified.
- Unnecessary recomputation avoided.
- Control flow primitives chosen appropriately.
- Async and loading states explicit.
- Accessibility and semantic markup considered.
- SSR/hydration concerns addressed where relevant.
- Tests/check commands listed for validation.
- Citations include normalized `doc_id` references for non-trivial claims.

## [PLAN AUTOMATION]
- **LIVING DOCUMENT:** @PLAN.md is the single source of truth for project state.
- **SYNC RULE:** Before finishing any task, you MUST update @PLAN.md. 
- **CONTENT:** Move finished items to 'Completed', update 'Current Status', and refine 'Next Steps'.
- **SELF-CORRECTION:** If the code you wrote deviates from the @PLAN.md, update the plan to reflect the new reality immediately.

## [SESSION & PROGRESS AUTOMATION]
- **MANDATORY FILES:** This project uses `@TODO.md` (active tasks) and `@PROGRESS.md` (history/changelog).
- **INITIALIZATION:** If these files do not exist at the start of a session, you MUST generate them by scanning the codebase and `@PLAN.md`.
- **REAL-TIME UPDATES:** 
  - Mark tasks as `[ ]` (pending), `[/]` (in-progress), or `[x]` (completed) immediately as you work.
  - Update `@PROGRESS.md` after every major functional change with a 1-sentence "What & Why" summary.
 
## Scaffolding and Bootstrap Expectations

- Prefer minimal, production-realistic defaults.
- Document package/tooling choices and tradeoffs.
- Provide clear extension points for scaling teams.
- Keep generated structures simple and predictable.

## RULE: Performant Game Ticks (Combat Loop)
You are a Game Engine Architect. You MUST follow these performance and reactivity constraints:

### 1. THE TICK ARCHITECTURE
- ALWAYS use `setInterval` inside an `onMount` block.
- ALWAYS use `onCleanup` to clear the interval (prevent memory leaks).
- DEFAULT TICK: 100ms (10 frames per second for idle logic).

### 2. REACTIVE ACCESS (CRITICAL)
- NEVER use `context.player`. ALWAYS use `state.player` (or the correct property path from the context).
- NEVER destructure inside the loop (e.g., `const { hp } = enemy` is FORBIDDEN). Access properties directly: `enemy.hp`.

### 3. PERFORMANCE BATCHING
- ALL state updates within the loop MUST be wrapped in a single `batch(() => { ... })` call. 
- This ensures the UI only re-renders once per tick, even with 50+ enemies.

### 4. CALCULATION SAFETY
- ALWAYS use `Math.max(0, newHp)` to prevent negative health.
- ALWAYS use `Math.floor()` for damage numbers to keep the store clean of floating-point decimals.
