# Quick Reference Card (Rakanishu)

**Purpose:** Fast lookup for common patterns. Read full docs (SOLID-MASTER.md, RAKANISHU-GAME.md) only when you need details.

---

## SOLIDJS CORE RULES

### Reactivity (No Destructuring!)
```typescript
// ❌ WRONG:
function Enemy({ name, hp }) { ... }
const { player } = gameState;

// ✅ CORRECT:
function Enemy(props) {
  return <div>{props.name}: {props.hp}</div>;
}
const hp = gameState.player.hp;
```

### State Management
```typescript
// Signals (primitives):
const [count, setCount] = createSignal(0);
setCount(count() + 1);

// Stores (objects/arrays):
const [state, setState] = createStore({ player: { hp: 100 } });
setState("player", "hp", 50);  // Path-based setter
```

### Control Flow
```typescript
// Lists:
<For each={items}>{(item) => <div>{item}</div>}</For>

// Conditionals:
<Show when={condition} fallback={<B/>}><A/></Show>

// Multi-branch:
<Switch>
  <Match when={x === 1}><A/></Match>
  <Match when={x === 2}><B/></Match>
</Switch>
```

### Performance
```typescript
// ALWAYS batch loop updates:
batch(() => {
  for (let i = 0; i < enemies.length; i++) {
    setState("enemies", i, "hp", hp => hp - damage);
  }
});
```

### Lifecycle
```typescript
onMount(() => {
  const interval = setInterval(() => { /* logic */ }, 100);
  onCleanup(() => clearInterval(interval)); // ← MANDATORY
});
```

---

## RAKANISHU ARCHITECTURE

### State Pattern
- **Location:** `src/gameState.ts`
- **Exports:** `[gameState, setGameState]`
- **Pattern:** Module-level store (NO Context)
- **Access:** Import directly, use path-based setters

### UI Layout (3-Column Dashboard)
```tsx
<div class="h-screen overflow-hidden bg-[#0a0a0a] flex">
  <div class="w-1/4 overflow-y-auto">{/* Player Stats */}</div>
  <div class="w-1/2">{/* Combat (no scroll) */}</div>
  <div class="w-1/4 overflow-y-auto">{/* Loot Log */}</div>
</div>
```

### Gothic Color Palette
```css
Background:   bg-[#0a0a0a]
Panels:       bg-[#1a1a1a]
Borders:      border-[#2a2a2a]
Health:       bg-[#8a0000] or text-[#8a0000]
Gold:         text-[#ffd700]
Text:         text-[#d1d1d1]
Muted:        text-[#6b6b6b]
```

### Game Loop
- **Tick Rate:** 100ms (10 FPS)
- **Pattern:** `onMount` + `setInterval` + `onCleanup`
- **Performance:** Wrap all combat updates in `batch()`

### Combat System
- **Type:** Whirlwind AOE (hits all enemies per tick)
- **Targeting:** Loop through `gameState.enemies`, skip dead ones
- **Damage:** Path-based: `setState("enemies", i, "hp", ...)`
- **Safety:** `Math.max(0, hp - damage)` prevents negatives

---

## COMMON PATTERNS

### Add Enemy Type
```typescript
// 1. Add to enemyDatabase in gameState.ts:
Zombie: { name: "Zombie", baseHp: 80, damage: 10, xpReward: 25, goldReward: 8 }

// 2. Add to type union:
export type EnemyType = "Slime" | "Rat" | "Zombie";
```

### Add Item
```typescript
// 1. Define in gameState.ts:
interface Item {
  id: string;
  name: string;
  type: "weapon" | "armor" | "consumable";
  value: number;
}

// 2. Add to inventory:
setState("inventory", itemId, qty => (qty || 0) + 1);
```

### Update Player Stat
```typescript
// Health:
setState("player", "hp", hp => Math.max(0, hp - damage));

// Gold:
setState("player", "gold", g => g + amount);

// Level up:
setState("player", "level", l => l + 1);
setState("player", "maxHp", hp => Math.floor(hp * 1.15));
```

---

## FORBIDDEN PATTERNS

❌ **Destructuring:** `const { hp } = props` or `const { player } = state`  
❌ **React lists:** `items.map(item => ...)`  
❌ **Ternaries:** `{condition ? <A/> : <B/>}`  
❌ **Default colors:** `bg-gray-800`, `text-white`  
❌ **Object spread on stores:** `setState({ ...state, player: {...} })`  
❌ **Missing cleanup:** `setInterval` without `onCleanup`  

---

## WHEN TO READ FULL DOCS

### Read SOLID-MASTER.md when:
- Building complex reactive logic
- Debugging reactivity issues
- Need detailed examples
- Working with advanced primitives (createResource, createMemo)

### Read RAKANISHU-GAME.md when:
- Need full UI layout specs
- Implementing game systems (assistants, hirelings, loot)
- Need persistence/localStorage patterns

### Read PLAN.md when:
- Starting a new task (check @PROGRESS)
- Need architecture context (@ARCHITECTURE)
- Understanding game mechanics (@SYSTEMS)
- Checking known issues (@TECHNICAL-DEBT)

---

**Token Cost:** ~500 tokens (vs 3.1k for full docs)  
**Savings:** 2.6k tokens per task (84% reduction)  
**Use:** Quick lookups, then load full docs only when needed
