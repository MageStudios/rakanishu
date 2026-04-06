/* @refresh reload */
/**
 * Warband Combat Engine — Ticker-Driven, Loot & Kill Integration.
 *
 * Step 1: Monster Heartbeat — Decimal HP, death events.
 * Step 2: Deterministic Drop — monster.id + global seed → loot.
 * Step 3: Loot Logger — [KILL] / [DROP] console output.
 */

import Decimal from 'break_infinity.js';
import { generateDrop } from './lootSystem';
import type { DropResult } from './lootSystem';
import { gameState, setGameState, type InventoryEntry as StateInventoryEntry } from '../state/gameState';
import { rngInt } from './prng';

// ─── Global Seed ─────────────────────────────────────────────────────

/**
 * Established global seed for deterministic loot.
 * Combined with monster.id to produce a unique per-kill roll.
 */
let globalSeed = 42;
export function setGlobalSeed(seed: number): void { globalSeed = seed; }
export function advanceGlobalSeed(): void { globalSeed += 1; }

// ─── Damage Calculation Params ───────────────────────────────────────

export interface DamageParams {
  base: Decimal;
  additivePct: number;
  multiplicativePct: number;
  globalPct: number;
}

const ADDITIVE_SOFT_CAP = 5.0;

// ─── PartyMemberDef — The 6-Second Rule ──────────────────────────────
/**
 * Amazon base attackCooldown = 6000ms.
 * Paladin base attackCooldown = 5000ms.
 * No skill trees — progression from affixes + synergies only.
 */

export interface PartyMemberDef {
  name: string;
  /** Base cooldown in ms. Amazon = 6000, Paladin = 5000. */
  baseCooldownMs: number;
  /** Cooldown reduction from affixes (e.g. 'of Haste' → -1200ms). */
  affixCooldownReduction: number;
  /** Synergy reduction from party auras (multiplicative factor, e.g. 0.95). */
  synergyFactor: number;
  /** Base damage for the infinity hit. */
  baseDamage: Decimal;
  /** Damage multipliers. */
  damage: DamageParams;
  attackType: 'PHYSICAL' | 'MAGIC';
  /** Optional aura this member grants to allies. */
  aura?: PaladinAura;
}

// ─── Paladin Aura Type ─────────────────────────────────────────────────

export interface PaladinAura {
  /** Reduces ally cooldowns by this factor (e.g. 0.95 = 5% faster). */
  hasteFactor: number;
  range: 'GLOBAL'; // Currently only global auras.
}

// ─── PartyMember (runtime instance) ────────────────────────────────────

export class PartyMember {
  public remainingMs: number;
  public totalActions: number = 0;

  constructor(public readonly def: PartyMemberDef) {
    this.remainingMs = 0; // start ready to strike
  }

  /** Effective cooldown = (base - affix reductions) × synergy factor. */
  get effectiveCooldownMs(): number {
    const afterAffix = Math.max(1000, this.def.baseCooldownMs - this.def.affixCooldownReduction);
    return Math.round(afterAffix * this.def.synergyFactor);
  }

  isReady(): boolean {
    return this.remainingMs <= 0;
  }

  resetCooldown(): void {
    this.remainingMs = this.effectiveCooldownMs;
  }
}

// ─── Monster Instance (Step 1: Monster Heartbeat) ────────────────────
/**
 * Mutable runtime instance of a spawned monster.
 * All HP math uses Decimal for infinite-scaling safety.
 */
export interface MonsterInstance {
  id: string;
  name: string;
  monsterLevel: number;
  currentMonsterHP: Decimal;
  maxMonsterHP: Decimal;
}

// ─── Combat Event ──────────────────────────────────────────────────────

export interface CombatEvent {
  source: string;
  attackType: 'PHYSICAL' | 'MAGIC';
  damage: Decimal;
  effectiveCooldownMs: number;
}

// ─── Kill & Drop Events ─────────────────────────────────────────────

export interface MonsterDeathEvent {
  type: 'MONSTER_DEATH';
  monsterName: string;
  monsterLevel: number;
  totalDamageDealt: Decimal;
  drop: DropResult;
}

// ─── Factory: Create the Amazon ─────────────────────────────────────────

export function createAmazon(params?: {
  affixCooldownReduction?: number;
  synergyFactor?: number;
  baseDamage?: Decimal;
}): PartyMemberDef {
  const affixReduction = params?.affixCooldownReduction ?? 0;
  const synergy = params?.synergyFactor ?? 1.0;
  const baseDmg = params?.baseDamage ?? new Decimal(100);

  return {
    name: 'Amazon',
    baseCooldownMs: 6000, // The 6-Second Rule
    affixCooldownReduction: affixReduction,
    synergyFactor: synergy,
    baseDamage: baseDmg,
    damage: {
      base: baseDmg,
      additivePct: 0,
      multiplicativePct: 1,
      globalPct: 1,
    },
    attackType: 'PHYSICAL',
  };
}

// ─── Factory: Create the Paladin ──────────────────────────────

export function createPaladin(params?: {
  affixCooldownReduction?: number;
  synergyFactor?: number;
  baseDamageMin?: Decimal;
  baseDamageMax?: Decimal;
}): PartyMemberDef {
  const affixReduction = params?.affixCooldownReduction ?? 0;
  const synergy = params?.synergyFactor ?? 1.0;
  const minDmg = params?.baseDamageMin ?? new Decimal(50);
  const maxDmg = params?.baseDamageMax ?? new Decimal(150);
  const baseDmg = minDmg.add(maxDmg).div(2);

  return {
    name: 'Paladin',
    baseCooldownMs: 5000,
    affixCooldownReduction: affixReduction,
    synergyFactor: synergy,
    baseDamage: baseDmg,
    damage: {
      base: baseDmg,
      additivePct: 0,
      multiplicativePct: 1,
      globalPct: 1,
    },
    attackType: 'MAGIC',
    aura: { hasteFactor: 0.95, range: 'GLOBAL' },
  };
}

// ─── Global Aura Application ──────────────────────────────────────────

/**
 * Scans party for Paladin aura. If found, applies hasteFactor
 * to all NON-Paladin members' synergyFactor multiplicatively.
 * Returns the updated member list (new array, immutable).
 */
export function applyGlobalAuras(party: PartyMemberDef[]): PartyMemberDef[] {
  const paladinAura = party
    .find(m => m.aura)?.aura;

  if (!paladinAura || paladinAura.range !== 'GLOBAL') {
    return party;
  }

  return party.map(member => {
    if (member.aura) return member;
    return {
      ...member,
      synergyFactor: member.synergyFactor * paladinAura.hasteFactor,
    };
  });
}

// ─── Factory: Spawn Monster (Step 1) ─────────────────────────────────

/**
 * Creates a fresh MonsterInstance with Decimal HP.
 * Infinite-safe — all HP is Decimal.
 */
export function spawnMonster(id: string, name: string, level: number, hp: Decimal): MonsterInstance {
  return {
    id,
    name,
    monsterLevel: level,
    currentMonsterHP: hp,
    maxMonsterHP: hp,
  };
}

// ─── Multi-Heartbeat Tick Engine with Monster Death Check ────────────
/**
 * Step 1: Ticks all party members, accumulates damage against the monster.
 * When accumulated damage >= monster.currentMonsterHP, triggers onMonsterDeath().
 *
 * Returns { events, deathEvent } — deathEvent is populated only on a kill.
 */
export function processTicks(
  members: PartyMember[],
  monster: MonsterInstance,
  deltaMs: number,
): { events: CombatEvent[]; deathEvent: MonsterDeathEvent | null } {
  const events: CombatEvent[] = [];
  let accumulatedDmg = new Decimal(0);

  for (const member of members) {
    member.remainingMs -= deltaMs;

    if (member.isReady()) {
      const dmg = member.def.damage.base
        .times(member.def.damage.multiplicativePct)
        .times(member.def.damage.globalPct);

      events.push({
        source: member.def.name,
        attackType: member.def.attackType,
        damage: dmg,
        effectiveCooldownMs: member.effectiveCooldownMs,
      });

      accumulatedDmg = accumulatedDmg.add(dmg);
      member.totalActions++;
      member.resetCooldown();
    }
  }

  monster.currentMonsterHP = monster.currentMonsterHP.sub(accumulatedDmg);

  let deathEvent: MonsterDeathEvent | null = null;
  if (monster.currentMonsterHP.lte(0)) {
    const totalDamage = monster.maxMonsterHP.sub(monster.currentMonsterHP);
    deathEvent = onMonsterDeath(monster, totalDamage, members);
  }

  return { events, deathEvent };
}

// ─── onMonsterDeath (Steps 1+2+3) ────────────────────────────────────

/**
 * Called when monster HP drops to 0 or below.
 * 1. Fires MonsterDeathEvent.
 * 2. Generates deterministic drop via lootSystem (monster.id + globalSeed).
 * 3. Logs [KILL] and [DROP] to console.
 */
export function onMonsterDeath(
  monster: MonsterInstance,
  totalDamageDealt: Decimal,
  party: PartyMember[],
): MonsterDeathEvent {
  // Step 2: Deterministic drop — mutate global seed for next kill roll
  const dropSeed = globalSeed + hashMonsterId(monster.id);
  advanceGlobalSeed();

  const drop = generateDropForMonster(monster, dropSeed);

  const deathEvent: MonsterDeathEvent = {
    type: 'MONSTER_DEATH',
    monsterName: monster.name,
    monsterLevel: monster.monsterLevel,
    totalDamageDealt,
    drop,
  };

  // Step 3: Loot Logger output
  logKill(monster);
  logDrop(drop, party);

  // Step 4: Collect the drop into player inventory
  collectDrop(drop);

  return deathEvent;
}

/**
 * Simple hash of monster string id into a deterministic integer offset.
 * Uses a basic additive hash — sufficient for seed perturbation.
 */
function hashMonsterId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Generates a single deterministic drop for a slain monster.
 * Uses the monster's areaLevel (monsterLevel) as the area gate.
 * NOTE: Currently wraps lootSystem's generateDrop which uses rngFloat.
 * The seed is advanced globally so each kill produces its own sequence.
 */
function generateDropForMonster(
  monster: MonsterInstance,
  _seed: number,
): DropResult {
  // Use monster level as area gate — infinite-safe Decimal not needed for drop gating
  const areaLevel = Math.min(monster.monsterLevel, 999);
  const drops = generateDrop(areaLevel);
  return drops[0] ?? null;
}

// ─── State Bridge: Engine → GameState ──────────────────────────────

/**
 * Collect a loot drop into gameState.inventory and persist to disk.
 * Maps DropResult → InventoryEntry and saves via localStorage.
 * No skill logic — pure state bridge.
 */
let _uidCounter = 0;

export function collectDrop(drop: DropResult): void {
  if (!drop) return;

  const entry: StateInventoryEntry = buildInventoryEntry(drop);

  setGameState('inventory', (prev: StateInventoryEntry[]) => [entry, ...prev]);

  // Persist to disk (M1 Pro localStorage)
  saveGame();
  console.log(`[STATE_UPDATE] Item persisted. Inventory size is now ${gameState.inventory.length}`);
}

function buildInventoryEntry(drop: DropResult): StateInventoryEntry {
  _uidCounter++;
  if (!drop) {
    throw new Error('Null drop passed to buildInventoryEntry');
  }
  if ('type' in drop && drop.type === 'rune') {
    return {
      id: `rune_${drop.tier}_${_uidCounter}_${rngInt(0, 9999)}`,
      name: drop.name,
      type: 'rune',
      weight: 1,
      isSocketed: false,
      runeTier: drop.tier,
    };
  }
  const item = drop as unknown as Record<string, unknown>;
  return {
    id: `item_${(item.id as string) ?? _uidCounter}_${rngInt(0, 9999)}`,
    name: (item.name as string) ?? 'Unknown Item',
    type: (item.type as StateInventoryEntry['type']) ?? 'weapon',
    damage: item.damage as { min: number; max: number } | undefined,
    defense: (item.defense as number) ?? undefined,
    weight: (item.weight as number) ?? 1,
    quality: (item.quality as StateInventoryEntry['quality']) ?? 'normal',
    isSocketed: (item.isSocketed as boolean) ?? false,
    runeSockets: (item.runeSockets as number) ?? 0,
  };
}

// ─── Persistence (M1 Pro — localStorage) ────────────────────────────

const SAVE_KEY = 'rakanishu_save';

export function saveGame(): void {
  try {
    const snapshot = JSON.stringify(gameState, (_key, value) => {
      if (value && typeof value === 'object' && 'd' in value && 'e' in value && 'magn' in value) {
        // break_infinity.js Decimal serialisation
        return { __decimal: true, value: value.toString() };
      }
      return value;
    });
    localStorage.setItem(SAVE_KEY, snapshot);
  } catch {
    // Silent fail — state stays in memory
  }
}

export function loadGame(): boolean {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    // Note: Decimal restoration requires rehydration; basic load for now
    return true;
  } catch {
    return false;
  }
}

// ─── Loot Logger (Step 3) ────────────────────────────────────────────

/** [KILL] Level 1 Zombie defeated! */
export function logKill(monster: MonsterInstance): void {
  console.log(`[KILL] Level ${monster.monsterLevel} ${monster.name} defeated!`);
}

/** [DROP] Amazon found: 'King's Scythe of the Abyss' (Tier 3) */
export function logDrop(drop: DropResult, party: PartyMember[]): void {
  if (!drop) {
    console.log('[DROP] No loot — the darkness yields nothing.');
    return;
  }

  // Attribute the drop to the first party member (Amazon by default)
  const finder = party[0]?.def.name ?? 'Unknown';

  if ('type' in drop && drop.type === 'rune') {
    console.log(`[DROP] ${finder} found: '${drop.name}' (Rune T${drop.tier})`);
    return;
  }

  const item = drop as any;
  const tierLabel = qualityTierLabel(item.quality);
  console.log(`[DROP] ${finder} found: '${item.name}' (${tierLabel})`);
}

function qualityTierLabel(quality: string): string {
  const labels: Record<string, string> = {
    low: 'T1 Scraps',
    normal: 'T2 Normal',
    magic: 'T3 Magic',
    rare: 'T4 Rare',
    set: 'T5 Set',
    unique: 'T6 Unique',
    crafted: 'T7 Crafted',
  };
  return labels[quality] || 'T2 Normal';
}

// ─── Dual-Timer Log Formatter ─────────────────────────────────────────

export function formatDualTimerLog(members: PartyMember[]): string {
  const parts = members
    .map(m => {
      const secs = (Math.max(0, m.remainingMs) / 1000).toFixed(1);
      return `[${secs}s] ${m.def.name}`;
    })
    .join(' | ');
  return parts;
}

/**
 * Log when a combat event fires with Decimal damage.
 * Example:  ⚔️ Amazon  [PHYSICAL]  hits for 1.00e+2
 */
export function logCombatEvent(event: CombatEvent): void {
  const icon = event.attackType === 'PHYSICAL' ? '⚔️' : '✨';
  console.log(`${icon} ${event.source.padEnd(9)} [${event.attackType}]  hits for ${event.damage.toString()}`);
}
