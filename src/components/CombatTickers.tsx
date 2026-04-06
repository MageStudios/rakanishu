/* @refresh reload */
import { onCleanup, onMount } from "solid-js";
import { gameState, setGameState } from "../state/gameState";
import { generateDrop } from "../logic/lootSystem";
import { getZoneById } from "../data/zones";
import { findPlacement, type GridPlacement } from "../logic/spatialInventory";
import { PLAYER_GRID } from "../logic/spatialInventory";
import type { InventoryEntry } from "../state/gameState";

const BG = "#0a0a0a";
const BLOOD = "#880808";
const HOLY_GOLD = "#d4a43c";

/** Generate loot for a ticker completion and place in first empty spatial slot (0-39) */
function generateLoot(): string[] {
  const logs: string[] = [];
  const zoneState = gameState.world.currentZone;
  const zone = getZoneById(zoneState.id);
  const drops = generateDrop(zoneState.areaLevel, zone);

  for (const drop of drops) {
    if (!drop) continue;

    const isRune = "type" in drop && (drop as any).type === "rune";
    const entry: InventoryEntry = isRune
      ? {
          id: `rune_${(drop as any).name.toLowerCase()}_${Date.now()}`,
          name: (drop as any).name,
          type: "rune",
          weight: 1,
          isSocketed: false,
          runeTier: (drop as any).tier,
          w: 1,
          h: 1,
        }
      : {
          id: `item_${(drop as any).id || "drop"}_${Date.now()}`,
          name: (drop as any).name,
          type: (drop as any).type,
          damage: (drop as any).damage,
          defense: (drop as any).defense,
          weight: (drop as any).weight,
          quality: (drop as any).quality || "normal",
          isSuperior: (drop as any).isSuperior ?? false,
          isSocketed: (drop as any).isSocketed ?? false,
          runeSockets: (drop as any).runeSockets || 0,
          w: 1,
          h: 1,
        };

    const snap = gameState.inventorySpatial;
    const gridCopy = [...snap.grid];
    const pos = findPlacement(gridCopy, PLAYER_GRID.cols, PLAYER_GRID.rows, 1, 1);

    if (pos) {
      gridCopy[pos.y * PLAYER_GRID.cols + pos.x] = entry.id;
      setGameState("inventorySpatial", "grid", gridCopy);
      setGameState("inventorySpatial", "placements", (prev: Map<string, GridPlacement>) => {
        const m = new Map(prev);
        m.set(entry.id, { id: entry.id, x: pos.x, y: pos.y, w: 1, h: 1 });
        return m;
      });
      setGameState("inventory", (prev: InventoryEntry[]) => [...prev, entry]);
      logs.push(`[LOOT] ${entry.name}`);
    } else {
      setGameState("inventorySpatial", "ground", (prev: InventoryEntry[]) => [...prev, entry]);
      logs.push(`[GROUND] ${entry.name} — no space`);
    }
  }
  return logs;
}

function tick(key: "amazon" | "paladin", durationSec: number): () => void {
  let start = performance.now();
  let raf = 0;
  let fired = false;
  const frame = () => {
    const elapsed = (performance.now() - start) / 1000;
    const progress = Math.min(1, elapsed / durationSec);
    setGameState("combat", key, "progress", progress);

    if (progress >= 1 && !fired) {
      fired = true;
      const logs = generateLoot();
      const currentTick = gameState.tick.count;
      setGameState(
        "combat",
        "logs",
        (prev: any) => [
          ...prev,
          ...logs.map((msg: string) => ({
            tick: currentTick,
            source: "",
            target: "",
            value: 0,
            type: "loot" as const,
            isCrit: false,
            message: msg,
          })),
        ]
      );
      // Reset ticker for next cycle
      start = performance.now();
      setGameState("combat", key, "progress", 0);
      fired = false;
    }

    if (progress < 1 || !fired) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    setGameState("combat", key, "progress", 0);
  };
}

export default function CombatTickers() {
  let stopA: () => void;
  let stopP: () => void;

  onMount(() => {
    const state = gameState.combat as any;
    stopA = tick("amazon", state.amazon.durationSec ?? 5.7);
    stopP = tick("paladin", state.paladin.durationSec ?? 5.0);
  });
  onCleanup(() => {
    stopA();
    stopP();
  });

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
