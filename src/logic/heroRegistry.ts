/* @refresh reload */
/**
 * HeroRegistry — SolidJS createStore for the Hero Council
 *
 * Mage Studios Law compliance:
 * - Module-level store ONLY (no Context providers)
 * - No destructuring of hero objects — always access via path
 * - Reactive accessors return fresh copies (spread to break Solid proxies)
 * - No createSignal for game state — pure createStore
 *
 * Heroes are distinct from Companions:
 * - Companions assist in combat (shakira, kyra)
 * - Heroes form the Council, act as persistent multipliers/abilities
 */
import { createStore } from 'solid-js/store';

// ── Types ──────────────────────────────────────────────────────────────────

export type ActNumber = 1 | 2 | 3 | 4 | 5;

export interface Hero {
  id: string;
  name: string;
  baseDamage: number;
  actUnlock: ActNumber;
  unlocked: boolean;
  level: number;
  xp: number;
  /** Percentage multiplier this hero contributes when active (e.g., 1.25 = +25%) */
  damageMultiplier: number;
  /** Passive ability description */
  passive: string;
}

export type HeroSlot = 0 | 1 | 2; // Council has 3 active slots

export interface HeroRegistrySlice {
  heroes: Hero[];
  activeSlots: [Hero | null, Hero | null, Hero | null];
  councilBonus: number; // Global multiplier from heroes in slots
}

// ── Initial Data ───────────────────────────────────────────────────────────

const INITIAL_HEROES: Hero[] = [
  {
    id: 'shakira',
    name: 'Shakira',
    baseDamage: 15,
    actUnlock: 1,
    unlocked: true,
    level: 1,
    xp: 0,
    damageMultiplier: 1.25,
    passive: 'Spear Maiden — +25% physical damage',
  },
  {
    id: 'kaelan',
    name: 'Kaelan',
    baseDamage: 22,
    actUnlock: 2,
    unlocked: false,
    level: 0,
    xp: 0,
    damageMultiplier: 1.40,
    passive: 'Shadowblade — +40% critical strike damage',
  },
];

function createInitialSlice(): HeroRegistrySlice {
  return {
    heroes: INITIAL_HEROES.map(h => ({ ...h })),
    activeSlots: [null, null, null],
    councilBonus: 1.0,
  };
}

// ── Module-Level Store (Mage Studios Law: No Context, No Destructure) ──────

export const [heroStore, setHeroStore] = createStore<HeroRegistrySlice>(createInitialSlice());

// ── Reactive Accessors (safe — spread breaks Solid proxy chain) ────────────

/** Get all heroes. Does NOT destructure internals. */
export function getAllHeroes(): Hero[] {
  return heroStore.heroes.map(h => ({ ...h }));
}

/** Get a hero by ID. Returns undefined if not found. */
export function getHero(id: string): Hero | undefined {
  const h = heroStore.heroes.find(hero => hero.id === id);
  return h ? { ...h } : undefined;
}

/** Get heroes available for a given act (unlocked + not yet unlocked but at-level). */
export function getHeroesForAct(act: ActNumber): Hero[] {
  return heroStore.heroes
    .filter(h => h.actUnlock <= act)
    .map(h => ({ ...h }));
}

/** Get locked heroes for a given act (teases future content). */
export function getLockedHeroesForAct(act: ActNumber): Hero[] {
  return heroStore.heroes
    .filter(h => h.actUnlock === act && !h.unlocked)
    .map(h => ({ ...h }));
}

/** Get all heroes in active council slots. */
export function getActiveCouncil(): Hero[] {
  return heroStore.activeSlots.filter((s): s is Hero => s !== null).map(h => ({ ...h }));
}

/** Get hero at a specific slot (0–2). */
export function getCouncilSlot(slot: HeroSlot): Hero | null {
  const entry = heroStore.activeSlots[slot];
  return entry ? { ...entry } : null;
}

/** Recalculate the council's combined damage multiplier. */
export function recalcCouncilBonus(): number {
  let bonus = 1.0;
  for (let i = 0; i < 3; i++) {
    const hero = heroStore.activeSlots[i];
    if (hero) bonus *= hero.damageMultiplier;
  }
  return Math.round(bonus * 100) / 100;
}

// ── Actions (use path-based setters — Mage Studios Law) ───────────────────

/** Unlock a hero (e.g., after completing the act's mandatory boss). */
export function unlockHero(heroId: string): void {
  const hero = heroStore.heroes.find(h => h.id === heroId);
  if (!hero) return;
  if (hero.unlocked) return;
  setHeroStore('heroes', h => h.id === heroId, 'unlocked', true);
  // Auto-place into first empty slot
  const emptyIdx = heroStore.activeSlots.findIndex(s => s === null) as HeroSlot | -1;
  if (emptyIdx >= 0 && emptyIdx <= 2) {
    setHeroStore('activeSlots', emptyIdx as HeroSlot, { ...hero });
    setHeroStore('councilBonus', recalcCouncilBonus());
  }
}

/** Place a hero into a council slot. Swaps if slot is occupied. */
export function assignToSlot(heroId: string, slot: HeroSlot): void {
  const hero = heroStore.heroes.find(h => h.id === heroId);
  if (!hero || !hero.unlocked) return;
  const current = heroStore.activeSlots[slot];

  // If slot has a hero, move them back to pool (they're still unlocked, just not active)
  if (current) {
    // Find and clear the old slot, then swap
    const oldIdx = heroStore.activeSlots.findIndex(s => s !== null && s.id === current.id);
    if (oldIdx >= 0 && oldIdx <= 2) {
      setHeroStore('activeSlots', oldIdx as HeroSlot, null);
    }
  }

  // Remove hero from any other slot first
  for (let i = 0; i < 3; i++) {
    const s = heroStore.activeSlots[i];
    if (s && s.id === heroId) {
      setHeroStore('activeSlots', i as HeroSlot, null);
    }
  }

  setHeroStore('activeSlots', slot, { ...hero });
  setHeroStore('councilBonus', recalcCouncilBonus());
}

/** Remove a hero from a council slot. */
export function removeFromSlot(slot: HeroSlot): void {
  setHeroStore('activeSlots', slot, null);
  setHeroStore('councilBonus', recalcCouncilBonus());
}

/** Level up a hero (called from tick when hero xp threshold met). */
export function levelUpHero(heroId: string): void {
  const hero = heroStore.heroes.find(h => h.id === heroId);
  if (!hero) return;
  const newLevel = hero.level + 1;
  const newBaseDmg = hero.baseDamage + Math.floor(newLevel * 1.5);
  const newMult = hero.damageMultiplier + 0.05;

  setHeroStore('heroes', h => h.id === heroId, 'level', newLevel);
  setHeroStore('heroes', h => h.id === heroId, 'xp', 0);
  setHeroStore('heroes', h => h.id === heroId, 'baseDamage', newBaseDmg);
  setHeroStore('heroes', h => h.id === heroId, 'damageMultiplier', Math.round(newMult * 100) / 100);

  // Update in active slots if present
  for (let i = 0; i < 3; i++) {
    const s = heroStore.activeSlots[i];
    if (s && s.id === heroId) {
      setHeroStore('activeSlots', i as HeroSlot, 'level', newLevel);
      setHeroStore('activeSlots', i as HeroSlot, 'baseDamage', newBaseDmg);
      setHeroStore('activeSlots', i as HeroSlot, 'damageMultiplier', Math.round(newMult * 100) / 100);
    }
  }

  setHeroStore('councilBonus', recalcCouncilBonus());
}

/** Add XP to a hero (called from combatVictory). */
export function addHeroXp(heroId: string, xp: number): void {
  const hero = heroStore.heroes.find(h => h.id === heroId);
  if (!hero) return;
  const threshold = (hero.level + 1) * 50;
  const newXp = hero.xp + xp;
  if (newXp >= threshold && hero.level < 100) {
    levelUpHero(heroId);
  } else {
    setHeroStore('heroes', h => h.id === heroId, 'xp', newXp);
    // Also update active slot copy
    for (let i = 0; i < 3; i++) {
      const s = heroStore.activeSlots[i];
      if (s && s.id === heroId) {
        setHeroStore('activeSlots', i as HeroSlot, 'xp', newXp);
      }
    }
  }
}

/** Reset the registry (for tests). */
export function resetHeroRegistry(): void {
  setHeroStore(createInitialSlice());
}
