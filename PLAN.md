# Rakanishu: Project Plan & Memory Bank

**Last Updated:** 2026-03-22  
**Current Focus:** Combat System Implementation

---

## @PROGRESS (Current Sprint)

### Sprint Overview
- **Sprint Goal:** Combat System with Respawns + Loot
- **Active Sprint:** Combat System Implementation (Week 2 of 3)
- **Velocity:** 4/5 tasks completed in current milestone
- **Total Lines Added:** 150 (Combat + HUD)
- **Issues Resolved:** 2 (Combat Loop, Loot Drop)
- **Blockers:** None

### Active Tasks
1. [x] GameContext (Store + LocalStorage sync) - Complete
2. [x] Main HUD Layout (3-Column) - Complete
3. [/] Combat Engine (`combat.ts`) - **IN PROGRESS**
   - [x] Fixed store access patterns (no destructuring)
   - [x] Added batch() for performance
   - [ ] Implement respawn timer countdown logic
   - [ ] Add enemy death → loot drop integration
4. [ ] Loot Drop System (20% potion, 5% mace) - Pending
5. [ ] Enemy Respawn Logic - Pending

### Next Steps (Priority Order)
1. Finalize Combat Engine implementation (respawn timers)
2. Begin Loot Drop and Respawn system design
3. Create LootLog component for dropped items
4. Update documentation with new systems

---

## @ARCHITECTURE (Core Decisions - Reference for Modes)

### State Management
- **Pattern:** Module-level store pattern
- **Location:** `src/gameState.ts` exports `[gameState, setGameState]`
- **No Context:** Direct import/export, no Provider/Consumer pattern
- **Rationale:** Simpler, fewer tokens, perfect for single-player game

### UI Framework
- **Stack:** SolidJS v1.9.9 + Tailwind CSS v4
- **Colors:** Gothic hex palette only (see `.roo/rules/SOLID-MASTER.md`)
  - Background: `#0a0a0a` | Panels: `#1a1a1a`
  - Health: `#8a0000` | Gold: `#ffd700`
  - Text: `#d1d1d1` | Muted: `#6b6b6b`
- **Layout:** 3-column dashboard (`h-screen overflow-hidden`)
  - Left 25%: Player stats
  - Center 50%: Combat view
  - Right 25%: Loot log + Inventory

### Game Loop
- **Tick Rate:** 100ms fixed timestep (10 FPS for idle logic)
- **Performance:** `batch()` wraps all combat updates
- **Lifecycle:** `onMount` starts interval, `onCleanup` clears it
- **Combat:** Whirlwind AOE (hits all enemies per tick)

### Persistence
- **Storage:** LocalStorage with auto-save via `createEffect`
- **Format:** JSON with `version` field for migrations
- **Hydration:** Use `reconcile()` to preserve reactivity

---

## @SYSTEMS (Game Mechanics - How It Works)

### Combat System
- **Type:** Whirlwind AOE (player attacks all enemies simultaneously)
- **Damage Application:** 
  - Loop through `gameState.enemies` array
  - Apply damage to all enemies with `hp > 0`
  - Use path-based setter: `setGameState("enemies", i, "hp", ...)`
  - Wrap in `batch()` for single DOM update per tick

### Enemy Respawn
- **Mechanism:** Timer-based countdown
  - When `enemy.hp <= 0`, set `respawnTimer = 30` (ticks)
  - Decrement timer each tick
  - When `respawnTimer === 0`, reset `hp = maxHp`
- **Visual:** Show countdown in UI (optional)

### Loot System
- **Drop Rates:** 
  - 75% Gold (varying amounts)
  - 20% Potion (healing item)
  - 5% Weapon/Armor (random rarity)
- **Rarity Tiers:** Normal (gray) / Magic (blue) / Rare (yellow) / Unique (gold text)
- **Storage:** `inventory: Record<itemId, quantity>`

### Assistants vs Hirelings
- **Assistants:** Permanent unlocks (auto-seller, potion-giver)
  - Stored: `player.assistants: Assistant[]`
  - Do NOT use hireling slots
- **Hirelings:** Temporary combat allies (max 3 active)
  - Stored: `player.hirelings: Hireling[]` (length ≤ 3)

---

## @COMPLETED (Recent History - Last 2-3 Sessions)

### 2026-03-22 - Combat Refactor & Optimization
- ✅ Fixed `combat.ts` SolidJS violations (removed destructuring)
- ✅ Created `gameState.ts` as single source of truth
- ✅ Consolidated 7 rule files → 2 (SOLID-MASTER + RAKANISHU-GAME)
- ✅ Optimized `.roomodes` (1.5k tokens, 80% smaller)
- ✅ Deleted redundant context.md and old rule files
- **Impact:** +4.7k token savings for local AI

### 2026-03-21 - Initial Project Setup
- ✅ Scaffolded Rakanishu SolidJS project
- ✅ Defined gothic color palette
- ✅ Set up 5 specialist modes (Orchestrator, Architect, Stylist, Debug, Sage)
- ✅ Created initial `gameState.ts` and `combat.ts`

*Archive entries older than 3 sessions to HISTORY.md to keep token cost low.*

---

## @TECHNICAL-DEBT (Known Issues)

### High Priority
- [ ] `combat.ts` uses hardcoded enemy indexes in some places (should iterate all)
- [ ] No error handling for localStorage failures

### Medium Priority
- [ ] HP bar transitions could be smoother (add `transition-duration`)
- [ ] Loot log doesn't auto-scroll to newest items

### Low Priority
- [ ] Consider adding combat sound effects
- [ ] Particle effects for loot drops would be nice

---

## @QUESTIONS (Needs Decision)

### Design Decisions Needed
- **Loot Rarity:** Should rare items be 1% or 5% drop rate?
- **Respawn Strategy:** Do ALL enemies respawn, or just some types?
- **Combat Visual:** Animations or just number updates?

### Technical Decisions Needed
- **Testing:** Unit tests or manual QA only?
- **Deployment:** Netlify, Vercel, or GitHub Pages?

*Move answered questions to @ARCHITECTURE or delete after resolution.*

---

**End of PLAN.md**

**Usage Guide for Modes:**
- **Orchestrator:** Read entire file before delegating work
- **Architect:** Focus on @ARCHITECTURE and @SYSTEMS
- **Stylist:** Check @ARCHITECTURE for color/layout rules
- **Debug:** Review @TECHNICAL-DEBT for known issues
- **All modes:** Update @PROGRESS after task completion
