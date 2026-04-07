/* @refresh reload */
/**
 * Persistent Game State Module (Module-Level Store)
 * SolidJS createStore + Equipment system + xoshiro256** PRNG.
 * Mage Studios Law: Single source of truth. No Math.random(). Uses logic/prng.
 */
import { createStore, reconcile } from 'solid-js/store';
import Decimal from 'break_infinity.js';
import { combatTick } from '../logic/combatSystem';
import { generateDrop, type DropResult } from '../logic/lootSystem';
import { getZoneById, act1Zones, isMandatoryZone } from '../data/zones';
import { createSpatialInventory, type SpatialInventory } from '../logic/spatialInventory';
import { TurnEntry, CombatLogEntry } from '../logic/combatTypes';
import { rngInt } from '../logic/prng';
import { calculateHolyBoltHeal, getHolyBoltThreshold, calculateExperience } from '../logic/formulas';
import { ALL_COMPANIONS, getCompanionById } from '../data/companions';
import { scaleMonsterStats } from '../data/scalingTable';
import { getMonsterById, ZONE_MONSTER_MAP } from '../data/monsters';

// ───── Companion & Gate Types ─────
type CompanionId = 'shakira' | 'kyra';

// ───── Types ────
export type EquipmentSlot = 'weapon' | 'armor' | 'shield' | 'helm';

export interface InventoryEntry {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'shield' | 'helm' | 'rune';
  damage?: { min: number; max: number };
  defense?: number;
  weight: number;
  quality?: 'low' | 'normal' | 'magic' | 'rare' | 'set' | 'unique' | 'crafted';
  isSuperior?: boolean;
  isSocketed: boolean;
  runeSockets?: number;
  runeTier?: number;
  /** Grid width (columns) — default 1 */
  w?: number;
  /** Grid height (rows) — default 1 */
  h?: number;
}

export interface EquipmentState {
  weapon: InventoryEntry | null;
  armor: InventoryEntry | null;
  shield: InventoryEntry | null;
  helm: InventoryEntry | null;
}

const runewordHint: Record<string, string> = {
  El: 'weapon: +1 Light Radius', Eld: 'weapon: -6 Mana cost per spell',
  Tir: 'weapon: +2 Mana/kill', Nef: 'weapon: Knockback',
  Eth: 'weapon: -25 Target Defense', Ith: 'weapon: +9 Max Damage',
  Tal: '+75 Poison dmg', Ral: '+5-30 Fire dmg', Ort: '+1-50 Lightning dmg',
  Thul: '+3-14 Cold dmg', Amn: '7% Life Steal', Sol: '+9 Min dmg',
  Shael: '+20% IAS', Dol: '+75 Open Wounds', Hel: '-15% Req.',
  Io: '+10 Vitality', Lum: '+10 Energy', Ko: '+10 Dexterity',
  Fal: '+10 Strength', Lem: '+50% MF', Pul: '+30% Resist All',
  Um: 'Half Freeze Dur.', Mal: 'Prevent Monster Heal', Ist: '+25% MF',
  Gul: '+20% Attack Rating', Vex: '+7% Life/Mana Steal',
  Ohm: '+50% Enhanced Damage', Lo: '+20% Deadly Strike',
  Sur: '+50 Life', Ber: 'Dmg -5%', Jah: '+50 Life',
  Cham: 'Cannot Be Frozen', Zod: 'Indestructible',
};

export const qualityColor: Record<string, string> = {
  low: '#696969', normal: '#ffffff', magic: '#4b69ff',
  rare: '#ffff00', set: '#00ff00', unique: '#908858', crafted: '#ff8400',
};

export function getItemColor(item: InventoryEntry): string {
  if (item.type === 'rune') return '#ff8400';
  return qualityColor[item.quality || 'normal'] || qualityColor.normal;
}

// ───── Time Formatting Helper ─────
function formatTime(ticks: number): string {
  const totalSeconds = Math.floor(ticks * 0.1); // each tick is 100ms
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ───── Initial State ─────
const initialZone = getZoneById('blood_moor')!;

const initialGameState = {
  player: { hp: 100, maxHp: 100, level: 1, xp: new Decimal(0), gold: new Decimal(0), agility: 2, isHolyBoltAutomated: false, holyBoltLevel: 0 },
  party: ['player', 'shakira'] as string[], // Initial party: Player + Shakira
  partySize: 2,
  enemy: { name: 'Shade', hp: 50, maxHp: 50, level: 1 },
  monster: null as any, // Holds current monster blueprint/level reference
  tick: { count: 0 },
  settings: { debugMode: false },
  world: {
    currentZone: {
      id: initialZone.id, name: initialZone.name,
      areaLevel: initialZone.areaLevel, zoneType: initialZone.zoneType,
      bossName: initialZone.bossName,
      bossDropMultiplier: initialZone.bossDropMultiplier ?? 1.0,
    },
    nextZoneId: 'den_of_evil',
    allZoneIds: act1Zones.map(z => z.id),
  },
  equipment: { weapon: null as InventoryEntry | null, armor: null as InventoryEntry | null, shield: null as InventoryEntry | null, helm: null as InventoryEntry | null },
  inventory: [] as InventoryEntry[],
  inventorySpatial: createSpatialInventory(),

  // ── Companions ──
  activeCompanion: 'shakira' as CompanionId,
  lockedCompanions: ['kyra'] as CompanionId[],
  shakira: {
    id: 'shakira' as const, name: 'Shakira',
    hp: 120, maxHp: 120, speed: 3,
    strength: 8, agility: 6, intellect: 3, defense: 4,
    type: 'PHYSICAL' as const, skills: ['Jab'] as string[],
  },
  kyra: {
    id: 'kyra' as const, name: 'Kyra',
    hp: 80, maxHp: 80, speed: 4,
    strength: 4, agility: 10, intellect: 5, defense: 2,
    type: 'PHYSICAL' as const, skills: ['Cold Arrow'] as string[],
  },
  bossDefeatedFlags: {} as Record<string, boolean>,

  stashPages: [] as any[],
  stashOverflow: [] as any[],

  combat: {
    phase: 'IDLE',
    activeEnemy: {
      name: '', hp: 0, maxHp: 0, speed: 0,
      strength: 0, agility: 0, intellect: 0,
      defense: 0, type: 'PHYSICAL' as const,
    } as {
      name: string; hp: number; maxHp: number; speed: number;
      strength: number; agility: number; intellect: number;
      defense: number; type: 'PHYSICAL' | 'MAGIC' | 'UNDEAD' | 'DEMON' | 'BEAST' | 'BOSS' | 'UBER';
      monsterType?: 'UNDEAD' | 'DEMON' | 'BEAST' | 'HUMAN';
      quality?: 'NORMAL' | 'CHAMPION' | 'UNIQUE' | 'BOSS' | 'UBER';
    },
    logs: [] as CombatLogEntry[],
    playerSpeed: 3,
    turnQueue: [] as TurnEntry[],
    chillStacks: 0,
    amazon: { progress: 0, durationSec: 5.7 },
    paladin: { progress: 0, durationSec: 5.0 },
  },

  // ── Formatted Time Getter ──
  get formattedTime(): string {
    // Use direct property access; 'this' refers to the store proxy
    const count = (this as any).tick?.count ?? 0;
    return formatTime(count);
  },
};

export const [gameState, setGameState] = createStore(initialGameState);

// ───── Monster Spawning Action ─────
/**
 * Spawn a monster by blueprint ID using the scaling system.
 * Uses player level to determine monster level (player level ±1 range, clamped).
 * Updates both 'monster' store field and the active combat enemy.
 *
 * Mage Studios Law: No destructuring. Use path-based setters.
 */
export function spawnMonster(monsterId: string): void {
  const playerLevel = gameState.player.level;

  // Map zone display name → blueprint ID if needed
  const resolvedId = ZONE_MONSTER_MAP.get(monsterId) || monsterId;

  const blueprint = getMonsterById(resolvedId);
  if (!blueprint) {
    console.error(`[spawnMonster] Monster blueprint not found: ${monsterId} (resolved: ${resolvedId})`);
    return;
  }

  // 1. Get stats for the monster at the current area level
  const zone = gameState.world.currentZone;
  const areaLevel = zone.areaLevel || 1;
  
  // Determine monster level (±1 around area level, min 1)
  const levelRoll = rngInt(0, 2) - 1; // -1, 0, or +1
  let monsterLevel = areaLevel + levelRoll;
  if (monsterLevel < 1) monsterLevel = 1;

  // Apply "The Meat" factor (HP/XP scaling based on partySize)
  const isBossZone = zone.zoneType.startsWith('boss_') || !!zone.bossName;
  const tier = isBossZone ? 'uber' : 'normal'; 
  const scaledStats = scaleMonsterStats(monsterLevel, blueprint, tier as any, gameState.partySize);

  // Build monster instance
  const monsterInstance = {
    id: blueprint.id,
    name: blueprint.name,
    level: monsterLevel,
    type: blueprint.type,
    hp: scaledStats.hp,
    maxHp: scaledStats.hp,
    xp: scaledStats.xp, // Locked XP at spawn
    damageMin: scaledStats.dmg,
    damageMax: Math.floor(scaledStats.dmg * 1.3),
    speed: blueprint.velocity,
    strength: 10 + Math.floor(scaledStats.dmg / 2),
    agility: 10 + Math.floor(monsterLevel / 3),
    intellect: 10 + Math.floor(monsterLevel / 4),
    defense: scaledStats.ac,
  };

  // Update store using Mage Studios Law path-based setters (no destructuring)
  setGameState('monster', monsterInstance);
  setGameState('enemy', {
    name: monsterInstance.name,
    hp: monsterInstance.hp,
    maxHp: monsterInstance.maxHp,
    level: monsterInstance.level,
  });
  setGameState('combat', 'activeEnemy', {
    name: monsterInstance.name,
    hp: monsterInstance.hp,
    maxHp: monsterInstance.maxHp,
    speed: monsterInstance.speed,
    strength: monsterInstance.strength,
    agility: monsterInstance.agility,
    intellect: monsterInstance.intellect,
    defense: monsterInstance.defense,
    type: monsterInstance.type,
  });

  // Reset combat logs and start combat
  setGameState('combat', 'phase', 'COMBAT');
  setGameState('combat', 'logs', []);
  setGameState('combat', 'turnQueue', []);
}

// ───── Reset helper for test isolation ─────
let _testResetCounter = 0;
export function resetGameState(): void {
  _testResetCounter++;
  // Core combat state — full deep reset to clear store proxies
  setGameState('combat', {
    phase: 'IDLE',
    activeEnemy: {
      name: '', hp: 0, maxHp: 0, speed: 0,
      strength: 0, agility: 0, intellect: 0,
      defense: 0, type: 'PHYSICAL' as const,
      monsterType: 'UNDEAD' as const,
      quality: 'NORMAL' as const,
    },
    logs: [] as CombatLogEntry[],
    playerSpeed: 3,
    turnQueue: [] as TurnEntry[],
  });
  // Player & enemy
  setGameState('player', { hp: 100, maxHp: 100, level: 1, xp: new Decimal(0), gold: new Decimal(0), agility: 2 });
  setGameState('enemy', { name: 'Shade', hp: 50, maxHp: 50, level: 1 });
  setGameState('monster', null);
  setGameState('tick', 'count', 0);
  // World
  const zone = getZoneById('blood_moor')!;
  setGameState('world', {
    currentZone: {
      id: zone.id, name: zone.name,
      areaLevel: zone.areaLevel, zoneType: zone.zoneType,
      bossName: zone.bossName,
      bossDropMultiplier: zone.bossDropMultiplier ?? 1.0,
    },
    nextZoneId: 'den_of_evil',
    allZoneIds: act1Zones.map(z => z.id),
  });
  // Companions & flags
  setGameState('activeCompanion', 'shakira');
  setGameState('lockedCompanions', ['kyra']);
  setGameState('bossDefeatedFlags', {});
  setGameState('shakira', {
    id: 'shakira', name: 'Shakira',
    hp: 120, maxHp: 120, speed: 3,
    strength: 8, agility: 6, intellect: 3, defense: 4,
    type: 'PHYSICAL', skills: ['Jab'],
  });
  setGameState('kyra', {
    id: 'kyra', name: 'Kyra',
    hp: 80, maxHp: 80, speed: 4,
    strength: 4, agility: 10, intellect: 5, defense: 2,
    type: 'PHYSICAL', skills: ['Cold Arrow'],
  });
  // Inventory & stash
  setGameState('equipment', { weapon: null, armor: null, shield: null, helm: null });
  setGameState('inventory', []);
  setGameState('stashPages', []);
  setGameState('stashOverflow', []);
  setGameState('settings', { debugMode: false });
}

// ───── Unique ID generator ─────
let _uidCounter = 0;
function genId(prefix: string): string {
  _uidCounter++;
  return `${prefix}_${gameState.tick.count}_${_uidCounter}_${rngInt(0, 9999)}`;
}

// ───── Effective Stats Computation ─────
export function getEffectivePlayerStats() {
  const base = gameState.player;
  const eq = gameState.equipment as EquipmentState;
  let bonusDmgMin = 0, bonusDmgMax = 0, bonusDef = 0, bonusWeight = 0;
  const w = eq.weapon;
  if (w?.damage) { bonusDmgMin += w.damage.min; bonusDmgMax += w.damage.max; bonusWeight += w.weight; }
  const a = eq.armor;
  if (a) { bonusDef += a.defense ?? 0; bonusWeight += a.weight; }
  const s = eq.shield;
  if (s) { bonusDef += s.defense ?? 0; bonusWeight += s.weight; }
  const h = eq.helm;
  if (h) { bonusDef += h.defense ?? 0; bonusWeight += h.weight; }
  return { hp: base.hp, maxHp: base.maxHp, agility: base.agility, bonusDmgMin, bonusDmgMax, bonusDef, bonusWeight };
}

// ───── Equip / Unequip ─────
export function equipItem(itemId: string): string[] {
  const idx = gameState.inventory.findIndex(i => i.id === itemId);
  if (idx < 0) return ['[ERROR] Item not found'];
  const item = gameState.inventory[idx];
  if (item.type === 'rune') return ['[ERROR] Runes cannot be equipped directly'];
  const slot = item.type as EquipmentSlot;
  const logs: string[] = [];
  const current = (gameState.equipment as any)[slot];
  if (current) logs.push(...unequipItem(slot));
  setGameState('equipment', slot, item);
  setGameState('inventory', (prev: InventoryEntry[]) => prev.filter(i => i.id !== itemId));
  logs.push(`[EQUIP] ${item.name} → ${slot}`);
  return logs;
}

export function unequipItem(slot: EquipmentSlot): string[] {
  const item = (gameState.equipment as any)[slot];
  if (!item) return [];
  const logs: string[] = [];
  setGameState('inventory', (prev: InventoryEntry[]) => [{ ...item }, ...prev]);
  setGameState('equipment', slot as 'weapon' | 'armor' | 'shield' | 'helm', null);
  logs.push(`[UNEQUIP] ${item.name} ← ${slot}`);
  return logs;
}

// ───── Socket Item with Rune ─────
export function socketItem(itemId: string, runeId: string): string[] {
  const logs: string[] = [];
  const itemIdx = gameState.inventory.findIndex(i => i.id === itemId);
  if (itemIdx < 0) { logs.push('[ERROR] Item not found in inventory'); return logs; }
  const item = gameState.inventory[itemIdx];
  if (item.type === 'rune') { logs.push('[ERROR] Cannot socket a rune'); return logs; }
  if (!item.runeSockets || item.runeSockets <= 0) { logs.push('[ERROR] No sockets available'); return logs; }
  const runeIdx = gameState.inventory.findIndex(i => i.id === runeId && i.type === 'rune');
  if (runeIdx < 0) { logs.push('[ERROR] Rune not found'); return logs; }
  const rune = gameState.inventory[runeIdx];
  const hint = runewordHint[rune.name] || `[${rune.name}]`;
  setGameState('inventory', itemIdx, 'runeSockets', item.runeSockets - 1);
  setGameState('inventory', (prev: InventoryEntry[]) => prev.filter(i => i.id !== runeId));
  setGameState('inventory', itemIdx, 'isSocketed', true);
  logs.push(`[SOCKET] ${rune.name} → ${item.name} (${item.runeSockets - 1} sockets remaining) [${hint}]`);
  return logs;
}

// ───── Drop Processing ─────
function processDrops(drops: DropResult[], zoneId: string): string[] {
  if (drops.length === 0) return [];
  const log: string[] = [];
  const zone = getZoneById(zoneId);
  const zoneLabel = zone ? zone.name : zoneId;
  for (const drop of drops) {
    if (drop === null) continue;
    if ('type' in drop && (drop as any).type === 'rune') {
      const rune = drop as { name: string; tier: number };
      const entry: InventoryEntry = {
        id: genId(`rune_${rune.name.toLowerCase()}`),
        name: rune.name, type: 'rune', weight: 1,
        isSocketed: false, runeTier: rune.tier,
      };
      setGameState('inventory', (prev: InventoryEntry[]) => [entry, ...prev]);
      log.push(`[LOOT] ${zoneLabel} → ${entry.name}`);
    } else {
      const d = drop as any;
      const entry: InventoryEntry = {
        id: genId(d.id || 'item'), name: d.name, type: d.type,
        damage: d.damage, defense: d.defense, weight: d.weight,
        quality: d.quality || 'normal',
        isSuperior: d.isSuperior ?? false,
        isSocketed: d.isSocketed ?? (d.runeSockets > 0),
        runeSockets: d.runeSockets || 0,
      };
      setGameState('inventory', (prev: InventoryEntry[]) => [entry, ...prev]);
      log.push(`[LOOT] ${zoneLabel} → ${entry.name}`);
    }
  }
  return log;
}

// ───── Create CombatLogEntry ─────
function makeLogEntry(tick: number, text: string, logType: 'system' | 'loot'): CombatLogEntry {
  return {
    tick, source: '', target: '', value: 0, type: logType as any,
    isCrit: false, message: text,
  };
}

// ───── Zone Transition Gate / Unlock Companions ─────

/**
 * 100% Clear Gate — the player may NOT advance past a mandatoryClear zone
 * unless its boss has been marked defeated.
 */
function checkZoneTransition(currentZoneId: string, nextZoneId: string): boolean {
  const currentZone = getZoneById(currentZoneId);
  if (!currentZone) return true; // unknown zone, allow pass-through
  if (!currentZone.mandatoryClear) return true; // non-mandatory, no gate
  // If the zone has a boss, it MUST be defeated
  if (currentZone.bossName) {
    const flagKey = `BOSS_${currentZone.bossName.toUpperCase().replace(/[^A-Z0-9_]/g, '_')}`;
    return gameState.bossDefeatedFlags[flagKey] === true;
  }
  // Boss-less mandatory zone (e.g., Blood Moor) — allow
  return true;
}

/** Mark a boss as defeated, check companion unlock conditions. */
export { markBossDefeated, checkZoneTransition, advanceZone };
function markBossDefeated(zoneId: string): void {
  const zone = getZoneById(zoneId);
  if (!zone || !zone.bossName) return;
  const flagKey = `BOSS_${zone.bossName.toUpperCase().replace(/[^A-Z0-9_]/g, '_')}`;
  setGameState('bossDefeatedFlags', flagKey, true);

  // Check companion unlock conditions
  for (const comp of ALL_COMPANIONS) {
    if (!comp.unlockCondition) continue;
    if (comp.unlockCondition.flag === flagKey && gameState.lockedCompanions.includes(comp.id as CompanionId)) {
      setGameState('lockedCompanions', (prev: CompanionId[]) => prev.filter(c => c !== comp.id));
    }
  }
}

// ───── Zone Progression ─────
function advanceZone(): void {
  const currentId = gameState.world.currentZone.id;
  const idx = gameState.world.allZoneIds.findIndex(id => id === currentId);
  const nextIdx = idx + 1;
  if (nextIdx >= gameState.world.allZoneIds.length) {
    setGameState('world', 'nextZoneId', '');
    setGameState('combat', 'logs', (prev: any) => [
      ...(prev as CombatLogEntry[]),
      makeLogEntry(gameState.tick.count, 'Act 1 Complete!', 'system'),
    ]);
    return;
  }
  const nextId = gameState.world.allZoneIds[nextIdx];

  // 100% Clear Gate — cannot advance if mandatory clear not met
  if (!checkZoneTransition(currentId, nextId)) {
    const currentZone = getZoneById(currentId)!;
    setGameState('combat', 'logs', (prev: any) => [
      ...(prev as CombatLogEntry[]),
      makeLogEntry(gameState.tick.count, `⛓ Gate sealed: ${currentZone.bossName} must be defeated before advancing.`, 'system'),
    ]);
    return;
  }
  const zone = getZoneById(nextId);
  if (!zone) return;
  setGameState('world', 'nextZoneId', nextIdx + 1 < gameState.world.allZoneIds.length ? gameState.world.allZoneIds[nextIdx + 1] : '');
  setGameState('world', 'currentZone', {
    id: zone.id, name: zone.name, areaLevel: zone.areaLevel, zoneType: zone.zoneType,
    bossName: zone.bossName, bossDropMultiplier: zone.bossDropMultiplier ?? 1.0,
  });
  setGameState('combat', 'logs', (prev: any) => [
    ...(prev as CombatLogEntry[]),
    makeLogEntry(gameState.tick.count, `Entered ${zone.name}`, 'system'),
  ]);
}

export function tick(): string {
  const currentTick = gameState.tick.count + 1;
  const eff = getEffectivePlayerStats();
  const currentPhase = gameState.combat.phase as any;
  const shakiraSnap = gameState.activeCompanion === 'shakira'
    ? gameState.shakira ?? undefined
    : undefined;
  const kyraSnap = (gameState.activeCompanion === 'kyra'
    && !gameState.lockedCompanions.includes('kyra'))
    ? gameState.kyra ?? undefined
    : undefined;
  const chillStacks = (gameState.combat as any).chillStacks ?? 0;

  const combatResult = combatTick(
    currentTick, currentPhase,
    eff.hp, eff.maxHp, eff.agility,
    gameState.combat.playerSpeed,
    gameState.combat.activeEnemy,
    gameState.combat.logs,
    gameState.combat.turnQueue,
    gameState.player.xp.toNumber(),
    gameState.player.level,
    shakiraSnap,
    kyraSnap,
    chillStacks,
  );

  // ── Compute NEW HP values from deltas (BEFORE any setGameState to avoid stale proxies) ──
  let newPlayerHp = Math.max(1, gameState.player.hp + combatResult.playerHpDelta);
  const newShakiraHp = gameState.shakira ? Math.max(1, gameState.shakira.hp + (combatResult.shakiraHpDelta || 0)) : 0;
  const newKyraHp = gameState.kyra ? Math.max(1, gameState.kyra.hp + (combatResult.kyraHpDelta || 0)) : 0;
  const newEnemyHp = gameState.combat.activeEnemy
    ? gameState.combat.activeEnemy.hp + combatResult.enemyHpDelta
    : 0;

  // ── Holy Bolt Auto-Sustain ──
  let holyHealLog = '';
  if (gameState.player.isHolyBoltAutomated && gameState.player.holyBoltLevel > 0) {
    const threshold = getHolyBoltThreshold(gameState.player.holyBoltLevel);
    const hpPct = newPlayerHp / gameState.player.maxHp;
    if (hpPct < threshold) {
      const heal = calculateHolyBoltHeal(gameState.player.holyBoltLevel, gameState.player.maxHp);
      newPlayerHp = Math.min(gameState.player.maxHp, newPlayerHp + heal);
      holyHealLog = `Holy Bolt restores ${heal} HP (${Math.round(hpPct * 100)}% → ${Math.round((newPlayerHp / gameState.player.maxHp) * 100)}%)`;
    }
  }
  // ── Apply state updates ──
  setGameState('combat', 'phase', combatResult.newPhase);
  setGameState('combat', 'turnQueue', combatResult.newTurnQueue);
  setGameState('combat', 'chillStacks', combatResult.chillStacks);

  // ── Single batched log append per tick (prevents Solid Proxy deadlock) ──
  setGameState('combat', 'logs', (prev: CombatLogEntry[]) => {
    const combined = [...prev, ...combatResult.newLogs];
    return combined.length > 50 ? combined.slice(-50) : combined;
  });

  if (combatResult.newEnemy) setGameState('combat', 'activeEnemy', combatResult.newEnemy);
  if (holyHealLog) {
    setGameState('combat', 'logs', (prev: CombatLogEntry[]) => [
      ...prev,
      makeLogEntry(currentTick, holyHealLog, 'system'),
    ]);
  }

  // ── Player HP ──
  setGameState('player', 'hp', newPlayerHp);

  // ── Companion HP ──
  if (combatResult.shakiraHpDelta && gameState.shakira) {
    setGameState('shakira', 'hp', newShakiraHp);
  }
  if (combatResult.kyraHpDelta && gameState.kyra) {
    setGameState('kyra', 'hp', newKyraHp);
  }

  // ── Update enemy HP ──
  if (combatResult.enemyHpDelta !== 0 && gameState.combat.activeEnemy) {
    setGameState('combat', 'activeEnemy', {
      ...gameState.combat.activeEnemy,
      hp: newEnemyHp,
    });
  }

  // ── CHECK DEATH (uses computed values, not stale store reads) ──
  if (combatResult.playerHpDelta < 0 && newPlayerHp <= 1) {
    setGameState('player', 'hp', 1);
    setGameState('combat', 'phase', 'IDLE');
    setGameState('tick', 'count', currentTick);
    setGameState('combat', 'logs', (prev: CombatLogEntry[]) => [
      ...prev,
      makeLogEntry(currentTick, 'You have been slain!', 'system'),
    ]);
    return 'death';
  }

  // ── CHECK VICTORY (uses newEnemyHp, not stale gameState.combat.activeEnemy.hp) ──
  const enemyDied = combatResult.enemyHpDelta < 0 && newEnemyHp <= 0;

  if (enemyDied && combatResult.newPhase === 'FINISHED') {
    // ── Compute XP earned from kill (using Ratio-Based calculateExperience) ──
    const currentLevel = gameState.player.level;
    const monsterXp = (gameState as any).monster?.xp || 10;
    const expGain = calculateExperience(
      (gameState as any).monster?.level || 1,
      currentLevel,
      monsterXp,
      'normal', // Default rarity for now
      gameState.partySize
    );
    const newXp = gameState.player.xp.add(expGain);
    setGameState('player', 'xp', newXp);

    const zoneState = gameState.world.currentZone;
    const zone = getZoneById(zoneState.id);
    const drops = generateDrop(zoneState.areaLevel, zone);
    const lootLogs = processDrops(drops, zoneState.id);

    if (zone?.bossName) markBossDefeated(zoneState.id);

    if (newXp.gte(currentLevel * 30)) {
      setGameState('player', 'level', currentLevel + 1);
      setGameState('player', 'xp', new Decimal(0));
      setGameState('player', 'maxHp', gameState.player.maxHp + 20);
      setGameState('player', 'hp', gameState.player.maxHp + 20);
      lootLogs.push('[LEVEL UP] You are now level ' + (currentLevel + 1));
    } else {
      setGameState('player', 'hp', Math.min(gameState.player.maxHp, gameState.player.hp + 20));
    }

    advanceZone();

    // Spawn next monster from the new zone
    const newZone = gameState.world.currentZone;
    const zoneData = getZoneById(newZone.id);
    if (zoneData && zoneData.monsters.length > 0) {
      const idx = Math.floor(rngInt(0, zoneData.monsters.length - 1));
      const monsterName = zoneData.monsters[idx];
      const monsterId = monsterName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      spawnMonster(monsterId);
    } else if (zoneData && zoneData.bossName) {
      const bossId = zoneData.bossName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      spawnMonster(bossId);
    }

    // Batch: combine all loot entries into one append
    const lootEntries = lootLogs.map(msg =>
      makeLogEntry(currentTick, msg, 'loot')
    );
    if (lootEntries.length > 0) {
      setGameState('combat', 'logs', (prev: CombatLogEntry[]) => {
        const combined = [...prev, ...lootEntries];
        return combined.length > 50 ? combined.slice(-50) : combined;
      });
    }

    setGameState('tick', 'count', currentTick);
    return 'victory';
  }

  setGameState('tick', 'count', currentTick);
  return 'combat_cont';
}
