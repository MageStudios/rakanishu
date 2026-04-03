/**
 * Game Shell - Module-Level Store Integration
 */
import { Component } from 'solid-js';
import { createSignal } from 'solid-js';

// Import module-level stores (The Law)
import { gameState } from '../state/gameState';
import { combatState, resolveCombat, updateCombatState } from './combatState';

const GameShell: Component = () => {
  // UI toggles only (LOCAL)
  const [showCombat, setShowCombat] = createSignal(true);

  // Derive reactivity from module state (NO destructuring)
  const playerStats = { hp: gameState("player", "hp"), level: gameState("player", "level") };
  const activeEnemy = { name: gameState("enemy", "name") };

  return (
    <div class="min-h-screen bg-obsidian font-gothic">
      {/* Header */}
      <header class="flex justify-center items-center h-20 border-b border-blood-red">
        <h1 class="text-blood-red text-5xl uppercase tracking-widest">The Ritual</h1>
      </header>

      {/* Main Layout - 3 Column Grid */}
      <main class="grid grid-cols-4 gap-0 mt-8">
        {/* Left Column - 25% */}
        <aside class="col-span-1 h-full">
          <div class="panel">
            <h2 class="text-bone text-xl mb-4">Player Status</h2>
            <div class="text-bone text-sm">
              <p><strong>Level:</strong> {playerStats.level}</p>
              <p><strong>Health:</strong> {Math.floor(playerStats.hp)} / 100</p>
            </div>
          </div>
        </aside>

        {/* Center Column - 50% (Main Combat Arena) */}
        <section class="col-span-2 h-full">
          {showCombat() && (
            <div class="panel">
              {/* Dynamic Combat Ticker (NO Clicks) */}
              <div class="combat-log">{`> ${activeEnemy.name} attacks...`}</div>
              
              {/* Damage Display */}
              <div class="damage-flash">HP: {playerStats.hp}</div>
            </div>
          )}
        </section>

        {/* Right Column - 25% */}
        <aside class="col-span-1 h-full">
          <div class="panel" style="min-height: 50vh;">
            <h2 class="text-bone text-xl mb-4">Combat Logs</h2>
            <div class="combat-log h-[calc(100%-4rem)] overflow-y-auto">
              {/* Logs injected via SolidJS Signal (Efficiency) */}
              {combatState.tickHistory.map((tick, i) => (
                <div class="mb-2">
                  {tick.isCrit 
                    ? <span class="text-bone">CRITICAL HIT!</span> 
                    : <span class="text-obsidian">Minor hit</span>
                  }
                  {tick.damage > 0 ? ` - ${tick.damage} DMG` : ''}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Controls - Ticker Driven Only */}
      <footer class="fixed bottom-0 left-0 right-0 bg-obsidian border-t border-blood-red p-4">
        <div class="text-bone text-sm">
          Tick: {gameState("tick", "count")} | RNG Seed: {combatState.rng ? combatState.rng.next().toString() : 'INIT'}
        </div>
      </footer>
    </div>
  );
};

export default GameShell;
