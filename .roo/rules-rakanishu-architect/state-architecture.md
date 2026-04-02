# State Architecture Law - Rakanishu

## CRITICAL: Single Source of Truth Pattern

This project uses a **Module-Level Store** pattern, NOT Context providers.

### The Source of Truth

**`src/gameState.ts`** is the ONLY source of truth for game data.

```
┌─────────────────────────────────┐
│      src/gameState.ts           │  ← SINGLE SOURCE OF TRUTH
│  (Module-Level Store)           │
│                                 │
│  export const [gameState,       │
│                setGameState]    │
│                                 │
│  • Player stats                 │
│  • Loot & inventory             │
│  • Combat log                   │
│  • Game meta state              │
└─────────────────────────────────┘
         ↑         ↑         ↑
         │         │         │
    Direct imports everywhere
         │         │         │
    ┌────┘    ┌────┘    └────┐
    │         │              │
┌───┴───┐ ┌───┴───┐ ┌────────┴────┐
│ HUD   │ │Combat │ │  Loot Log   │
│ .tsx  │ │ .ts   │ │    .tsx     │
└───────┘ └───────┘ └─────────────┘
```

### The Two-Store Pattern

We have TWO stores, each with a specific purpose:

#### 1. `gameState` (Persistent, Long-term)
**Location:** `src/gameState.ts`
**Purpose:** Permanent game data that survives between waves/sessions
**Contains:**
- Player progression (level, gold, XP)
- Inventory and loot history
- Combat log (permanent record)
- Game meta (isPlaying, gameState enum)

**Persistence:** Saved to localStorage via `saveGame()` / `loadGame()`

#### 2. `combatState` (Ephemeral, Short-term)
**Location:** `src/combat.ts`
**Purpose:** Temporary combat data that resets each wave
**Contains:**
- Active combat enemies
- Tick counters
- Combat-specific timers

**Persistence:** Never saved (resets each combat)

---

## Mandatory Usage Patterns

### ✅ CORRECT: Reading State
```typescript
import { gameState } from './gameState';

function PlayerHUD() {
  // Direct reactive access
  return (
    <div>
      <p>HP: {gameState.player.hp}</p>
      <p>Gold: {gameState.player.gold}</p>
    </div>
  );
}
```

### ✅ CORRECT: Writing State
```typescript
import { setGameState, addLootDrop, addCombatLog } from './gameState';

// Path-based setter
setGameState("player", "gold", (g) => g + 50);

// Helper functions
addLootDrop(item, 50);
addCombatLog("gold", "Found 50 gold!");
```

### ✅ CORRECT: Multiple Updates
```typescript
import { batch } from "solid-js";
import { setGameState } from './gameState';

// Batch for performance
batch(() => {
  setGameState("player", "gold", (g) => g + 50);
  setGameState("player", "xp", (xp) => xp + 100);
  setGameState("player", "totalKills", (k) => k + 1);
});
```

---

## ❌ FORBIDDEN Anti-Patterns

### ❌ WRONG: Creating Local State Copies
```typescript
// FORBIDDEN! This creates a non-reactive copy
const [gold, setGold] = createSignal(gameState.player.gold);
```

**Why it's wrong:** Changes to `gameState.player.gold` won't update `gold()`, and vice versa. You now have TWO sources of truth that can diverge.

### ❌ WRONG: Context Providers for Game State
```typescript
// FORBIDDEN! Don't wrap game state in Context
<GameProvider>
  <App />
</GameProvider>

const { state } = useGameContext(); // WRONG!
```

**Why it's wrong:** Adds unnecessary complexity. Context is for component-tree-scoped state, but game state is global and singular.

### ❌ WRONG: Direct Mutation
```typescript
// FORBIDDEN! Always use setGameState
gameState.player.gold = 100; // BREAKS REACTIVITY!
```

### ❌ WRONG: Destructuring State
```typescript
// FORBIDDEN! Breaks reactivity
const { player } = gameState;
const { gold } = gameState.player;

// Use direct access instead:
gameState.player.gold // ✅ CORRECT
```

---

## Decision Tree: "Where Does This State Go?"

```
Is it game data that persists between waves/sessions?
├─ YES → Add to `gameState.ts`
│         Examples: player stats, inventory, loot history
│
└─ NO → Is it temporary combat data?
    ├─ YES → Add to `combatState` in `combat.ts`
    │         Examples: active enemies, tick counters
    │
    └─ NO → Is it UI-only state?
        ├─ YES → Local component state (createSignal)
        │         Examples: modal open/closed, tooltip visible
        │
        └─ You probably need `gameState.ts`
```

---

## Common Scenarios

### Adding New Game Data
**Question:** "I need to track player achievements"
**Answer:** Add to `gameState.ts`

```typescript
// In gameState.ts
export interface Player {
  // ... existing fields
  achievements: string[]; // ← Add here
}

const defaultPlayer: Player = {
  // ... existing defaults
  achievements: [], // ← Add default
};
```

### Temporary UI State
**Question:** "I need to show/hide a modal"
**Answer:** Local component state

```typescript
function MyComponent() {
  const [isOpen, setIsOpen] = createSignal(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open</button>
      <Show when={isOpen()}>
        <Modal onClose={() => setIsOpen(false)} />
      </Show>
    </>
  );
}
```

### Combat-Specific Data
**Question:** "I need to track enemy respawn timers"
**Answer:** Already in `combatState` (see `combat.ts`)

---

## Migration Rule

**If you find yourself creating state outside of `gameState.ts` or `combatState`, STOP and ask:**

1. Does this data persist between waves? → `gameState.ts`
2. Is this temporary combat data? → `combatState` in `combat.ts`
3. Is this pure UI state? → Local `createSignal`

**If none of the above, it probably belongs in `gameState.ts`.**

---

## Enforcement

Before writing ANY state-related code:
1. Check if it already exists in `gameState.ts`
2. If not, determine where it belongs using the decision tree
3. Add it to the appropriate store
4. Use helper functions for common operations

**Never create duplicate sources of truth.**
