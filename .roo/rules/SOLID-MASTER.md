# SolidJS Master Reference (Rakanishu)

**CRITICAL**: This is your single source of truth for SolidJS patterns. Read this BEFORE writing any code.

---

## [1. REACTIVITY & PROPS]

### The "No Destructuring" Rule (MOST COMMON BUG)
- **NEVER** destructure `props` in components: `function MyComponent(props)` not `function MyComponent({ name })`
- **NEVER** destructure stores: `state.player.hp` not `const { hp } = state.player`
- **WHY**: SolidJS uses proxies. Destructuring breaks reactivity tracking.

### Signal Access
- Call signals as functions: `count()` not `count`
- Store access is direct: `state.player` not `state().player`

### Derived State
- Use `createMemo` for expensive derivations
- Use arrow functions for cheap ones: `const double = () => count() * 2`
- **NEVER** use `createEffect` to update one signal from another (use `createMemo` instead)

**Example:**
```typescript
// ❌ WRONG (React pattern):
function Enemy({ name, hp }) {
  return <div>{name}: {hp}</div>
}

// ✅ CORRECT (Solid pattern):
function Enemy(props) {
  return <div>{props.name}: {props.hp}</div>
}
```

---

## [2. STATE MANAGEMENT]

### Signals vs. Stores
- **Signals**: Use `createSignal` for primitives (string, number, boolean)
- **Stores**: Use `createStore` for objects and arrays
- **Rule**: If you need to update nested properties, use a Store

### Store Updates (Path-Based Setters)
- **ALWAYS** use path-based setters: `setState("player", "hp", 100)`
- **NEVER** use object spread: `setState({ ...state, player: { ...state.player, hp: 100 } })`
- **WHY**: Path-based updates preserve fine-grained reactivity

**Example:**
```typescript
// ❌ WRONG:
const { player } = state;
setState({ player: { ...player, hp: player.hp - 10 } });

// ✅ CORRECT:
setState("player", "hp", (hp) => hp - 10);
```

### Module-Level Stores (Rakanishu Pattern)
```typescript
// src/gameState.ts
import { createStore } from "solid-js/store";

export const [gameState, setGameState] = createStore({
  player: { hp: 100, gold: 0 },
  enemies: []
});

// Any component can import and use:
import { gameState, setGameState } from "./gameState";
```

---

## [3. CONTROL FLOW]

**CRITICAL**: Solid's built-in components are optimized for DOM reconciliation. 
Standard JS operators like `.map()` or `? :` re-render the ENTIRE list/node on every change.

### Lists & Collections
- **ALWAYS** use `<For>` for arrays: `<For each={items}>{(item) => <div>{item}</div>}</For>`
- **NEVER** use `.map()`: `{items.map(item => <div>{item}</div>)}` ❌
- Use `<Index>` when array items don't change but values do

### Conditional Rendering
- **ALWAYS** use `<Show>` for if/else: `<Show when={condition} fallback={<B/>}><A/></Show>`
- **NEVER** use ternary: `{condition ? <A/> : <B/>}` ❌
- Use `<Switch>/<Match>` for multiple conditions

### Dynamic Components
- Use `<Dynamic component={MyComp} />` when component type is reactive

**Example:**
```typescript
// ❌ WRONG (React pattern):
<div>
  {enemies.map(enemy => <Enemy key={enemy.id} data={enemy} />)}
  {isAlive ? <Player /> : <GameOver />}
</div>

// ✅ CORRECT (Solid pattern):
<div>
  <For each={enemies}>
    {(enemy) => <Enemy data={enemy} />}
  </For>
  <Show when={isAlive} fallback={<GameOver />}>
    <Player />
  </Show>
</div>
```

---

## [4. GAME LOOP & PERFORMANCE (Rakanishu-Specific)]

### Batching (MANDATORY for Loops)
- **ALWAYS** wrap store updates inside loops with `batch(() => { ... })`
- **WHY**: Prevents multiple DOM updates per tick (kills performance)

**Example:**
```typescript
import { batch } from "solid-js";

setInterval(() => {
  batch(() => {
    // All these updates happen in ONE DOM render:
    for (let i = 0; i < enemies.length; i++) {
      setGameState("enemies", i, "hp", (hp) => hp - damage);
    }
    setGameState("player", "gold", (g) => g + loot);
  });
}, 100);
```

### Lifecycle Hooks
- Use `onMount(() => { ... })` to start intervals/timers
- Use `onCleanup(() => clearInterval(id))` to prevent memory leaks
- **NEVER** forget cleanup - memory leaks will kill your game

**Example:**
```typescript
import { onMount, onCleanup } from "solid-js";

function CombatLoop() {
  onMount(() => {
    const interval = setInterval(() => {
      // Combat logic here
    }, 100);
    
    onCleanup(() => clearInterval(interval)); // ← MANDATORY
  });
  
  return null; // Hooks don't return JSX
}
```

### Math Safety
- Use `Math.max(0, newHp)` to prevent negative HP
- Use `Math.floor(damage)` to keep integers clean
- **NEVER** allow floating-point HP/gold in the store

---

## [5. GRIMDARK DESIGN SYSTEM (Rakanishu Colors)]

### Color Palette (HEX ONLY)
```typescript
// ❌ WRONG (default Tailwind):
className="bg-gray-900 text-white"

// ✅ CORRECT (gothic hex colors):
className="bg-[#0a0a0a] text-[#d1d1d1]"
```

### Full Palette:
- **Background**: `bg-[#0a0a0a]`
- **Panels**: `bg-[#1a1a1a]`
- **Borders**: `border-[#2a2a2a]`
- **Health/Blood**: `bg-[#8a0000]` or `text-[#8a0000]`
- **Gold/Uniques**: `text-[#ffd700]`
- **Standard Text**: `text-[#d1d1d1]`
- **Muted Labels**: `text-[#6b6b6b]`

### Layout Rules
- Use fractions: `w-1/3` not `w-33%`
- Use arbitrary values: `w-[30%]` not percentage strings
- **NEVER** use default Tailwind grays (bg-gray-800, etc.)

---

## [6. COMMON BUGS & FIXES]

### Bug #1: "hp is not a function"
**Cause**: Accessing a signal without calling it, or calling a store property as a function.
```typescript
// ❌ WRONG:
const hp = createSignal(100);
console.log(hp); // Logs the accessor function, not 100

// ✅ CORRECT:
console.log(hp()); // Logs 100
```

### Bug #2: "Cannot read property 'hp' of undefined"
**Cause**: Destructuring a store or accessing before it's initialized.
```typescript
// ❌ WRONG:
const { player } = gameState;
console.log(player.hp); // Breaks reactivity

// ✅ CORRECT:
console.log(gameState.player.hp); // Always reactive
```

### Bug #3: List doesn't update when items change
**Cause**: Using `.map()` instead of `<For>`.
```typescript
// ❌ WRONG:
{enemies.map(e => <div>{e.name}</div>)}

// ✅ CORRECT:
<For each={enemies}>{(e) => <div>{e.name}</div>}</For>
```

### Bug #4: Memory leak / interval keeps running
**Cause**: Forgot `onCleanup` to clear interval.
```typescript
// ❌ WRONG:
onMount(() => {
  setInterval(() => { /* combat */ }, 100);
  // Interval never stops!
});

// ✅ CORRECT:
onMount(() => {
  const id = setInterval(() => { /* combat */ }, 100);
  onCleanup(() => clearInterval(id));
});
```

---

## [7. QUICK REFERENCE CHECKLIST]

Before submitting ANY code, verify:

- [ ] No destructuring of props or stores?
- [ ] Using `<For>` not `.map()` for lists?
- [ ] Using `<Show>` not ternary for conditionals?
- [ ] Path-based store setters: `setState("key", value)`?
- [ ] `batch()` wrapping loop updates?
- [ ] `onCleanup()` clearing intervals/timers?
- [ ] Gothic hex colors, not default Tailwind?
- [ ] `Math.max(0, ...)` preventing negative HP?

**If ANY box is unchecked, STOP and fix before proceeding.**

---

## [8. FORBIDDEN PATTERNS (INSTANT FAIL)]

These patterns are **BANNED** in Rakanishu. If you see them, reject the code immediately:

```typescript
// ❌ BANNED #1: Destructuring
function Enemy({ name, hp }) { ... }
const { player } = gameState;

// ❌ BANNED #2: React list rendering
{enemies.map(e => <Enemy data={e} />)}

// ❌ BANNED #3: Ternary conditionals
{isAlive ? <Player /> : <Dead />}

// ❌ BANNED #4: Object spread on stores
setState({ ...gameState, player: { ...gameState.player, hp: 50 } });

// ❌ BANNED #5: Default Tailwind colors
className="bg-gray-900 text-white"

// ❌ BANNED #6: Forgetting cleanup
onMount(() => {
  setInterval(() => { ... }, 100);
  // Missing onCleanup!
});
```

---

**End of SOLID-MASTER.md**

Read this BEFORE every coding task. When in doubt, reference this file.
