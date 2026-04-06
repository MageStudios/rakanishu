# RAKANISHU PROJECT EXECUTIVE CHARTER

## 0. MANDATORY WORKFLOW (THE HANDOVER RULE)
- Every completed task MUST conclude with an automated update to PLAN.md and CLAUDE.md.
- Stale files like MEMORY.md should be deleted or merged immediately to prevent context drift.

## 1. CORE MISSION & STACK
- CONTEXT: Gothic incremental game. Maintain a dark, atmospheric technical tone.
- STACK: SolidJS, Tailwind CSS (Utility-first), Xoshiro256** PRNG.
- NO-CLICKING: Reject any task involving manual "Player Clicks." All combat and resources must be ticker-driven.
- HMR BOILERPLATE: Entry points (`src/index.tsx`, `src/App.tsx`) MUST start with `/* @refresh reload */` as the very first line. Component files do NOT require it.

## 2. STATE ARCHITECTURE (THE LAW)
- PATTERN: Module-Level Store ONLY. No Context Providers.
- SOURCE OF TRUTH: `src/gameState.ts` (Persistent) and `src/combatState.ts` (Ephemeral).
- REACTIVITY RULES:
  * NO DESTRUCTURING: Never destructure 'props' or 'state' (Instantly breaks Solid reactivity).
  * SIGNAL PURGE: 'createSignal' is FORBIDDEN for game state. Use ONLY for local UI toggles.
  * SETTERS: Use path-based setters: `setGameState("player", "hp", 100)`.

## 3. 🔥 MAGE STUDIOS LAW 🔥

### PRNG Algorithm
- **STRICTLY use xoshiro256\*\*** (BigInt 64-bit) for ALL loot RNG.
- `Math.random()` is a **critical failure** — never use it anywhere in the codebase.
- No PCG, no LCG, no other PRNGs.

### PRNG State
- Use a **4-element BigUint64Array** in `gameState.ts`.
- Seed it **ONCE at boot** using `crypto.getRandomValues()`.
- State **MUST advance on every roll** — verify no stuck/seeded behavior.

### Spatial Law
- **NO ITEM EXISTS WITHOUT DIMENSIONS.** Every `InventoryEntry` MUST have `w: number` and `h: number`.
- **INVENTORY IS A 10×4 GRID** (40 cells). Index = `y * 10 + x`. Items occupy contiguous cells.
- **canPlace(x, y, w, h):** Before placing any item, check bounds (`x+w ≤ 10`, `y+h ≤ 4`) AND cell occupancy. If no fit, item goes to `ground[]` (dropped items).
- **Ground is a separate array.** Dropped items that don't fit the grid are not lost — they sit in `gameState.ground` awaiting space.
- **Paper Doll slots have fixed dimensions AND type gates.** A Ring (1×1) cannot go in Head (2×2). Swap must match `item.type` to `slot.accepts`.
- **Draggable/movable:** Items in grid and paper doll MUST be relocatable via drag. Dragging over an occupied slot triggers swap-if-type-compatible.

### Data Purity
- `item.name` strings must be **sanitized** — no bracketed tags.
- Move all `[LOW]`, `[CRAFTED]`, and `[SUPERIOR]` tags to `item.quality` metadata only.

### Visual Law
- `[LOW]` items MUST render as **Gray (#696969)** regardless of base type (Rune, Weapon, etc).

## 4. HEARTBEAT LAW
Every session must begin with an automated audit of:
1. **PRNG advancing?** — xoshiro256** state changes on every roll, not stuck/seeded.
2. **Spatial grid?** — Inventory is a 10×4 grid with canPlace/drop logic.
3. **Name purity?** — No `[LOW]`, `[CRAFTED]`, `[SUPERIOR]` bracketed tags in any `item.name`.
4. **Low gray?** — `quality === 'low'` items render as `#696969` always.

## 5. SCALING & BESTIARY LAW

### Piecewise Generator Architecture
- **SOURCE:** `src/data/scalingTable.ts` — generator-based, NOT a static table. Supports levels 1–130+.
- **FUNCTION:** `getBaseStats(level)` returns `{ hp, xp, ac, dmg }` via piecewise exponential/linear curves.
- **MONSTERS ARE BLUEPRINTS:** `src/data/monsters.ts` stores only **percentage ratios** (hpRatio, xpRatio, acRatio, dmgRatio).
- **SCALING FORMULA:** `finalStat = getBaseStats(level).stat × (ratio / 100) × difficultyMult`

### Anchor Points (Hardcoded in the curve)
| Level | HP | XP | AC | DMG | Tier |
|-------|---------|---------|-----|-----|-----------|
| 1 | 7 | 15 | 2 | 1 | Normal start |
| 36 | 569 | 2,345 | 80 | 25 | Nightmare |
| 67 | 2,870 | 25,400 | 150 | 55 | Hell |
| 110 | ~19,049 | ~380,949 | 220 | 100 | Uber (Pandemonium) |

### Difficulty Multipliers
- **Normal:** 1.0× | **Nightmare:** 1.25× | **Hell:** 1.5× | **Uber:** 7.5× (Hell × 5 boss multiplier)

### Monster Blueprint Requirements
- Every `MonsterBlueprint` MUST include: `hpRatio, xpRatio, acRatio, dmgRatio, tierLevel, velocity, reach, vision, resistances`.
- All 7 monsters: `FALLEN, ZOMBIE, QUILL_RAT, UNDEAD_WARRIOR, DARK_ARCHER, BLOOD_LORD, HELL_WITCH`.
- No `shadow_hound` — deleted.
- `scaleMonster(blueprint, tier)` is the **ONLY** way to get scaled stats — never hardcode HP/XP in monster data.

## 6. LOOT & MATH CHARTER

### The Law of Infinity
- **All combat and item stats (HP, Damage, XP, Gold) MUST be `Decimal` objects from `break_infinity.js`.**
- **Never use primitive `number` for values that scale with level.**
- Multiplicative chains use `chainMul(base, ...multipliers)` — e.g., `total.times(affix)`.
- Source: `src/logic/math.ts` — exports `toDecimal()`, `format()`, `formatAffix()`, `chainMul()`.

### The Law of Determinism
- **Every item drop MUST be generated via the LootEngine using xoshiro256++ PRNG.**
- Seed = `monster.id + global.seed` — every drop is reproducible and auditable.
- **xoshiro256++** (not `**`) is used for affix/loot (`rngFloatP`, `rngIntP`, `rngWeighted`).
- Both `**` and `++` share the same 4-element `BigUint64Array` state — one advances the other.
- `Math.random()` remains a **critical failure**.

### The Law of Tiers
- **Follow the Gothic Naming Convention for all affixes and loot tiers:**
  `Bronze → Iron → Steel → King's → Godhand`
- Prefixes concatenate BEFORE base: `"King's" + "Scythe" = "King's Scythe"`
- Suffixes concatenate AFTER base: `"Scythe" + "of the Vampire" = "Scythe of the Vampire"`
- Full name: `"King's Scythe of the Vampire"`
- Each tier has a `minLevel` and a `Decimal` multiplier.
- Source: `src/data/affixes.ts` — 30 prefixes, 30 suffixes, 10 tiers each.

### The Law of Multiplicity
- **Affixes must be MULTIPLICATIVE, never additive:** `total = base.times(affixMult)`
- Combined affix multiplier: `prefix.multiplier × suffix.multiplier`
- Never: `base + bonus` — Always: `base.times(multiplier)`

## 7. EXECUTION PROTOCOLS

### Autonomous Batching Rule
- The Agent performs **exactly three atomic steps** before pausing for a summary.
- Each step must be a self-contained, verifiable unit of work (e.g., write file, run test, update docs).
- No manual "Yes/No" confirmation is required between the three steps — the batch runs autonomously.
- After the three steps complete, the Agent must output a **brief check-in summary** before proceeding to the next batch.

### Truncation Guard
- All code output blocks are **capped at 150 lines** to prevent upstream buffer errors (Alibaba/Qwen truncation).
- For files exceeding 150 lines, use the `write` tool directly — do not render them inline.
- Use `cat -n` or `sed -n` to show context-relevant slices instead of full-file dumps.

### Batch Completion Protocol
- Three steps → summary → check-in. Cycle repeats.
- If a step errors, the batch halts immediately and the error is surfaced before continuing.
- The summary must include: files changed, tests run, current blocking issues (if any).

## 8. GOTHIC VISUAL IDENTITY
- LAYOUT: 3-Column System (Left 25% | Center 50% | Right 25%).
- PALETTE: Obsidian (#0a0a0a), Panels (#1a1a1a), Blood-Red (#880808), Bone (#e2dac2).
- BANNED: No default Tailwind grays, no 'text-white', no percentage width strings.

## 9. CODE ORGANIZATION
- Extract large components (>200 lines) into dedicated files in `src/components/`.
- `App.tsx` must remain minimal (router/layout only — under 20 lines).

## 10. INFERENCE & TOOL PROTOCOLS
- WRITE STRATEGY: Always prefer `write_to_file` over `edit_file` for files < 300 lines.
- COMMIT STANDARDS: Format: `[type]: [desc]` (feat, fix, refactor, style).
- LEGACY: Ignore `.roo/rules/`, `AGENTS.md`, and `llms.txt` — this Charter is the singular truth.

## 11. AGENTIC OPERATIONAL HOOKS (ECC-STANDARD)

### Context & Memory Management
- **Checkpointing:** Before any major logic change (e.g., Loot tables, Combat cycles), create a `BACKUP_LOG.md` entry if a git commit is not immediate.
- **Truncation Mitigation:** If a task requires editing >3 files or >200 lines, break it into a step-by-step plan. Output code in chunks to prevent OpenRouter/Qwen buffer failures.
- **Session Continuity:** Every response must end with a brief "Next Step" summary to maintain context across potential session resets.

### Engineering Standards
- **DRY Logic, Moist State:** Keep logic functions pure and reusable. Keep state objects "moist" with all necessary metadata (like `item.quality`) to avoid secondary lookups.
- **Circular Check:** Before saving `src/` files, verify imports. Components must NEVER import from `gameState.ts` if they are also being imported BY `gameState.ts`.
- **The 4GB Rule:** Every `vitest` command MUST include `--max-old-space-size=4096` to protect the M1 Pro's worker threads.
- **No Destructuring (Priority 1 — Hotfix):** NEVER destructure `props`, `state`, or `gameState` values. Destructuring breaks SolidJS reactivity chains instantly. Extract values as primitives (`const hp = gameState.player.hp`) or use inline path-based access (`gameState.player.hp`) for rendering. Objects that capture destructured references become stale and will not trigger re-renders.
- **No Local Signals for Game State (Priority 2 — Stability):** `createSignal` is FORBIDDEN for any game-state-adjacent data. Use ONLY for pure UI toggles (e.g., `showPanel`, `isCollapsed`). If you need reactive game data, derive it directly from `gameState` via `createMemo` or inline path access.
- **PRNG Call Discipline (Priority 3 — Performance):** PRNG calls (`xoshiro256**` / `xoshiro256++`) MUST originate ONLY from logic/tick functions (e.g., `initCombatState`, loot generation, combat resolution). NEVER call PRNG from UI effects, `createEffect`, or render paths. UI derives; logic computes.

### TDD Enforcement (Skill-Harness)
- Refer to `./tests/CLAUDE.md` for specific "Red-Green-Refactor" cycles.
- **Failure-First:** If a bug is reported (like the 'Tick 43' freeze), the first action is writing a test in `src/logic/__tests__` that reproduces the hang.

## 12. THE ORCHESTRATION PROTOCOL (SIGRID-STYLE)
- **PRE-FLIGHT:** Before starting any task, run `git checkout master` and `git pull`.
- **ISOLATION:** Every task starts with `git checkout -b feature/[name]`.
- **COMMIT TRIGGER:** Only `git add` and `git commit` once a specific sub-goal is reached AND `npx tsc --noEmit` passes.
- **BATCHING:** If a feature is large (e.g., 10x4 Grid + Tooltips), commit the Grid first, then the Tooltips as separate commits on the same branch.
- **THE MERGE:** Once the entire feature is verified, merge to `master` and `git push`.

## 13. 🔥 API SHIELD & SQUIRREL-PATIENCE PROTOCOL 🔥

### Smooth Scaling
- **COOLDOWN:** Always prefix heavy tool chains with `sleep 15 && echo "🪿 [API_SHIELD]: Refilling token bucket..."`.
- **ACCELERATION GATE:** If a response fails with "Rate increased too quickly," the immediate next action MUST be a `sleep 60`.

### Shell Velocity Control
- **INTERLEAVE PAUSE:** Every `shell` command (grep, cat, npx) MUST be followed by a manual 3-5 second delay if another shell command is intended in the same turn.
- **BATCH COMMANDS:** Instead of running 5 separate `grep` calls, combine them into a single shell script or a semicolon-chained string: `grep "x" file && sleep 5 && grep "y" file`.
- **THROTTLE RECOVERY:** If "Request rate increased too quickly" occurs, the Agent MUST immediately execute `sleep 60` and wait before any further tool use.

### Context Isolation (The Snowball Guard)
- **TARGETED READS:** Never use `read_file` on files >500 lines (like `gameState.ts`) unless making an explicit structural change. Rely on grep or `ls` for verification.
- **ZERO-FOOTPRINT EDITS:** Avoid reading back files after writing to them. Trust the `npx tsc --noEmit` output as the source of truth for build health.
- **CONTEXT FLUSH:** If a conversation history exceeds 40k tokens (check logs), the Agent must summarize current progress and suggest a session reset to purge the "Token Snowball."