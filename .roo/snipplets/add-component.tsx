/**
 * SNIPPET: Add New UI Component
 * 
 * Use this template when creating new SolidJS components.
 * Follows project patterns and SOLID-MASTER.md rules.
 */

// ============================================================================
// BASIC COMPONENT STRUCTURE
// ============================================================================

import { Component } from 'solid-js';
import { For, Show } from 'solid-js';

// Component with props (NO DESTRUCTURING!)
const MyComponent: Component<{
  title: string;
  items: string[];
  isVisible: boolean;
}> = (props) => {  // ← NEVER destructure props
  
  // Local state (if needed)
  const [count, setCount] = createSignal(0);
  
  // Derived state (use createMemo for expensive calculations)
  const doubleCount = () => count() * 2;  // Simple derivation
  
  return (
    <div class="p-4 bg-[#1a1a1a] rounded">
      <h2 class="text-[#ffd700] text-xl mb-2">{props.title}</h2>
      
      {/* Use <Show> for conditionals */}
      <Show when={props.isVisible} fallback={<p>Hidden</p>}>
        <p>Count: {count()}</p>
      </Show>
      
      {/* Use <For> for lists */}
      <For each={props.items} fallback={<p>No items</p>}>
        {(item) => <div class="text-[#d1d1d1]">{item}</div>}
      </For>
    </div>
  );
};

export default MyComponent;

// ============================================================================
// COMPONENT WITH GAME STATE ACCESS
// ============================================================================

import { gameState, setGameState } from './gameState';

const PlayerStats: Component = () => {
  // Access global store directly (NO destructuring!)
  
  // Calculate percentage for HP bar
  const hpPercent = () => (gameState.player.hp / gameState.player.maxHp) * 100;
  
  return (
    <div class="p-4 bg-[#1a1a1a]">
      <h2 class="text-[#ffd700]">Player Stats</h2>
      
      {/* HP Bar */}
      <div class="mt-2">
        <span class="text-[#d1d1d1]">
          HP: {gameState.player.hp} / {gameState.player.maxHp}
        </span>
        <div class="w-full bg-[#2a2a2a] h-4 rounded overflow-hidden">
          <div 
            class="bg-[#8a0000] h-full transition-all duration-300"
            style={{ width: `${hpPercent()}%` }}
          />
        </div>
      </div>
      
      {/* Other stats */}
      <div class="mt-2 space-y-1">
        <p class="text-[#d1d1d1]">Level: {gameState.player.level}</p>
        <p class="text-[#ffd700]">Gold: {gameState.player.gold}</p>
        <p class="text-[#d1d1d1]">Damage: {gameState.player.damage}</p>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT WITH LIFECYCLE HOOKS
// ============================================================================

import { onMount, onCleanup } from 'solid-js';

const CombatLoop: Component = () => {
  onMount(() => {
    // Start interval on mount
    const interval = setInterval(() => {
      // Combat logic here
      console.log('Tick');
    }, 100);
    
    // CRITICAL: Always cleanup!
    onCleanup(() => clearInterval(interval));
  });
  
  return null;  // Hooks can return null if no UI
};

// ============================================================================
// COMPONENT WITH INTERACTIVE ELEMENTS
// ============================================================================

const HealthPotion: Component = () => {
  const usePotion = () => {
    // Update player HP (path-based setter)
    setGameState("player", "hp", (hp) => 
      Math.min(gameState.player.maxHp, hp + 50)
    );
    
    // Remove from inventory
    setGameState("inventory", "health-potion", (qty) => 
      Math.max(0, (qty || 0) - 1)
    );
  };
  
  return (
    <button
      class="px-4 py-2 bg-[#8a0000] hover:bg-[#a00000] text-[#d1d1d1] rounded transition-colors"
      onClick={usePotion}
      disabled={!gameState.inventory["health-potion"]}
    >
      Use Potion ({gameState.inventory["health-potion"] || 0})
    </button>
  );
};

// ============================================================================
// COMPONENT WITH COMPLEX LIST (Enemies, Inventory)
// ============================================================================

const EnemyList: Component = () => {
  return (
    <div class="space-y-2">
      <For 
        each={gameState.enemies}
        fallback={<p class="text-[#6b6b6b]">No enemies</p>}
      >
        {(enemy, index) => (
          <Show when={enemy.hp > 0}>
            <div class="p-2 bg-[#1a1a1a] rounded">
              <div class="flex justify-between">
                <span class="text-[#d1d1d1]">{enemy.name}</span>
                <span class="text-[#6b6b6b]">Lv.{enemy.level}</span>
              </div>
              
              {/* Enemy HP bar */}
              <div class="mt-1">
                <div class="w-full bg-[#2a2a2a] h-2 rounded overflow-hidden">
                  <div 
                    class="bg-[#8a0000] h-full"
                    style={{ 
                      width: `${(enemy.hp / enemy.maxHp) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </Show>
        )}
      </For>
    </div>
  );
};

// ============================================================================
// COMPONENT WITH MULTI-BRANCH CONDITIONALS
// ============================================================================

const GameStatus: Component = () => {
  return (
    <Switch>
      <Match when={gameState.gameState === "START"}>
        <div class="text-[#d1d1d1]">Press Start to Begin</div>
      </Match>
      
      <Match when={gameState.gameState === "PLAYING"}>
        <div class="text-[#ffd700]">Wave {gameState.currentWave}</div>
      </Match>
      
      <Match when={gameState.gameState === "WON"}>
        <div class="text-[#ffd700] text-2xl">Victory!</div>
      </Match>
      
      <Match when={gameState.gameState === "LOST"}>
        <div class="text-[#8a0000] text-2xl">Defeat</div>
      </Match>
    </Switch>
  );
};

// ============================================================================
// GOTHIC COLOR CLASSES (Copy/Paste Reference)
// ============================================================================

/*
BACKGROUNDS:
- bg-[#0a0a0a]  Main background
- bg-[#1a1a1a]  Panels/cards
- bg-[#2a2a2a]  Borders/dividers

TEXT:
- text-[#d1d1d1]  Standard text
- text-[#6b6b6b]  Muted/secondary text
- text-[#ffd700]  Gold/highlights
- text-[#8a0000]  Health/danger

INTERACTIVE:
- bg-[#8a0000] hover:bg-[#a00000]  Danger button
- bg-[#2a2a2a] hover:bg-[#3a3a3a]  Normal button

BORDERS:
- border-[#2a2a2a]  Default border
- border-[#8a0000]  Health/danger border
*/

// ============================================================================
// COMMON PATTERNS
// ============================================================================

/*
1. PERCENTAGE BARS (HP, XP, Progress):
<div class="w-full bg-[#2a2a2a] h-4 rounded overflow-hidden">
  <div 
    class="bg-[#8a0000] h-full transition-all"
    style={{ width: `${percentage}%` }}
  />
</div>

2. BUTTONS:
<button
  class="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#d1d1d1] rounded"
  onClick={handleClick}
>
  Click Me
</button>

3. CARDS/PANELS:
<div class="p-4 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
  Content
</div>

4. LISTS WITH FALLBACK:
<For each={items} fallback={<p>No items</p>}>
  {(item) => <div>{item}</div>}
</For>

5. CONDITIONAL RENDERING:
<Show when={condition} fallback={<Alternative/>}>
  <MainContent/>
</Show>
*/

// ============================================================================
// FORBIDDEN PATTERNS (DO NOT USE)
// ============================================================================

/*
❌ Destructuring props:
const MyComponent = ({ title, items }) => { ... }

❌ Using .map() for lists:
{items.map(item => <div>{item}</div>)}

❌ Using ternary for conditionals:
{condition ? <A/> : <B/>}

❌ Default Tailwind colors:
className="bg-gray-800 text-white"

❌ Accessing store as function:
gameState().player.hp

❌ Object spread on store:
setGameState({ ...gameState, player: {...} })
*/

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/*
After creating component:
□ No destructuring used
□ <For> used for lists (not .map)
□ <Show> used for conditionals (not ternary)
□ Gothic hex colors used
□ No default Tailwind colors
□ Path-based setters for state updates
□ onCleanup used for intervals/listeners
□ Component renders without errors
□ Responsive to state changes
*/
