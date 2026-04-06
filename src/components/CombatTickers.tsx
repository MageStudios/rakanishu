/* @refresh reload */
import { onCleanup, onMount } from "solid-js";
import { gameState, setGameState } from "../state/gameState";

const BG = "#0a0a0a"; // Obsidian
const BLOOD = "#880808"; // Blood Red — Amazon
const HOLY_GOLD = "#d4a43c"; // Holy Gold — Paladin

function tick(key: 'amazon' | 'paladin', durationSec: number): () => void {
  let start = performance.now();
  let raf = 0;
  const frame = () => {
    const elapsed = (performance.now() - start) / 1000;
    const progress = Math.min(1, elapsed / durationSec);
    setGameState('combat', key, 'progress', progress);
    if (progress < 1) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    setGameState('combat', key, 'progress', 0);
  };
}

export default function CombatTickers() {
  let stopA: () => void;
  let stopP: () => void;

  onMount(() => {
    const state = gameState.combat as any;
    stopA = tick('amazon', state.amazon.durationSec ?? 5.7);
    stopP = tick('paladin', state.paladin.durationSec ?? 5.0);
  });
  onCleanup(() => { stopA(); stopP(); });

  return (
    <div class="flex flex-col gap-2" style="color:#e2dac2; font-size:0.75rem">
      {/* Amazon ticker */}
      <div class="flex items-center gap-2">
        <span class="w-16 text-right shrink-0">Amazon</span>
        <div class="flex-1 h-1.5 rounded" style={`background:${BG}`}>
          <div
            class="h-full rounded"
            style={`background:${BLOOD}; width:${gameState.combat.amazon.progress * 100}%`}
          />
        </div>
      </div>
      {/* Paladin ticker */}
      <div class="flex items-center gap-2">
        <span class="w-16 text-right shrink-0">Paladin</span>
        <div class="flex-1 h-1.5 rounded" style={`background:${BG}`}>
          <div
            class="h-full rounded"
            style={`background:${HOLY_GOLD}; width:${gameState.combat.paladin.progress * 100}%`}
          />
        </div>
      </div>
    </div>
  );
}
