/* @refresh reload */
import { onCleanup, onMount } from "solid-js";
import { gameState, setGameState } from "../state/gameState";
import { rollRarity, applyRarity, type Item, type Rarity } from "../logic/loot";
import { findPlacement, type GridPlacement } from "../logic/spatialInventory";
import { PLAYER_GRID } from "../logic/spatialInventory";
import { rngInt } from "../logic/prng";
import Decimal from 'break_infinity.js';
import type { InventoryEntry } from "../state/gameState";

const BG = "#0a0a0a";
const BLOOD = "#8a0000";
const HOLY_GOLD = "#d4a43c";

/** Deterministic xoshiro256** PRNG for [0, max). Matches rngFloat signature. */
function rngUnit(max: number): number {
  return rngInt(0, max * 1000 - 1) / 1000;
}

interface ItemTemplate { id: string; name: string; type: string; baseStats: Record<string, number>; }

const TEMPLATES: ItemTemplate[] = [
  { id: 'short_bow', name: 'Short Bow', type: 'weapon', baseStats: { damage: 8 } },
  { id: 'leather_armor', name: 'Leather Armor', type: 'armor', baseStats: { defense: 12 } },
  { id: 'buckler', name: 'Buckler', type: 'shield', baseStats: { defense: 5 } },
  { id: 'cap', name: 'Cap', type: 'helm', baseStats: { defense: 3 } },
];

/** Generate loot for a ticker completion with rarity roll and place in first empty spatial slot (0-39) */
function generateLootWithRarity(): string[] {
  const logs: string[] = [];
  const templateIdx = rngInt(0, TEMPLATES.length - 1);
  const template = TEMPLATES[templateIdx];
  const item: Item = {
    id: `loot_${Date.now()}_${template.id}`,
    name: template.name,
    rarity: "Normal",
    stats: Object.fromEntries(Object.entries(template.baseStats).map(([k, v]) => [k, new Decimal(v)])),
    spatialIndex: -1,
    type: template.type as Item["type"],
  };

  // Rarity engine link — roll via deterministic weights and apply
  const rarity: Rarity = rollRarity(rngUnit);
  applyRarity(item, rarity);

  const entry: InventoryEntry = {
    id: item.id,
    name: item.name,
    type: item.type as any,
    damage: item.stats.damage ? { min: item.stats.damage.toNumber(), max: Math.ceil(item.stats.damage.toNumber() * 1.3) } : undefined,
    defense: item.stats.defense !== undefined ? item.stats.defense.toNumber() : undefined,
    weight: 1,
    quality: rarity.toLowerCase() as any,
    isSuperior: rarity === 'Unique',
    isSocketed: false,
    runeSockets: 0,
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
    logs.push(`[LOOT] [${rarity}] ${entry.name}`);
  } else {
    setGameState("inventorySpatial", "ground", (prev: InventoryEntry[]) => [...prev, entry]);
    logs.push(`[GROUND] [${rarity}] ${entry.name} — no space`);
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
      const logs = generateLootWithRarity();
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
    <div class="panel">
      <h2 class="text-bone text-xl mb-4">Combat</h2>
      <div class="flex flex-col gap-3" style="font-size:0.75rem">
        {/* Amazon — blood-red progress */}
        <div class="flex items-center gap-2">
          <span class="w-16 text-right shrink-0" style="color:#e2dac2">Amazon</span>
          <div class="flex-1 h-2" style={`background:${BG}; border:1px solid #8a0000`}>
            <div
              class="h-full"
              style={`background:${BLOOD}; transition: width 50ms linear;`}
              ref={(el) => {
                el.style.width = `${Math.round(gameState.combat.amazon.progress * 100)}%`;
              }}
            />
          </div>
        </div>
        {/* Paladin — holy-gold progress */}
        <div class="flex items-center gap-2">
          <span class="w-16 text-right shrink-0" style="color:#e2dac2">Paladin</span>
          <div class="flex-1 h-2" style={`background:${BG}; border:1px solid #8a0000`}>
            <div
              class="h-full"
              style={`background:${HOLY_GOLD}; transition: width 50ms linear;`}
              ref={(el) => {
                el.style.width = `${Math.round(gameState.combat.paladin.progress * 100)}%`;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
