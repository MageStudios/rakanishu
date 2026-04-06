/* @refresh reload */
/**
 * skillTree.ts — D2-Style Skill Tree with Combat Skill Support
 *
 * Each class/skill tree contains passive stat bonuses **and** active
 * combat skills that feed into the combat engine (multi-hit, effects).
 */
import { createStore } from 'solid-js/store';

// ─── Active Combat Skill Effects ───
export type SkillEffect = 'CHILL' | 'STUN' | 'LIFESTEAL' | 'MANADRAIN' | 'POISON' | 'NONE';

// ─── Active Combat Skill ───
export interface CombatSkill {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Mana cost to activate (0 for mercenary skills) */
  cost: number;
  /** Number of hits per cast (1 = single strike, 3 = triple like Jab) */
  hits: number;
  /** Damage multiplier per hit (0.8 = 80% base damage per hit) */
  damageModifier: number;
  /** Secondary effect (CHILL, STUN, etc.) — 'NONE' for pure damage */
  effect: SkillEffect;
  /** If effect has a magnitude (e.g., CHILL slowAmount: 0.3 = 30% slow) */
  slowAmount?: number;
  /** Effect duration in ms (e.g., 3000ms = 3 seconds of slow) */
  duration?: number;
  /** Icon / visual tag */
  icon: string;
}

// ─── Passive Skill Node ───
export interface SkillNode {
  id: string;
  name: string;
  description: string;
  type: 'attack' | 'defense' | 'passive' | 'utility';
  /** Stat bonus per level */
  bonusPerLevel: number;
  /** Stat this skill affects */
  statKey: 'strength' | 'agility' | 'intellect' | 'defense' | 'allResist' | 'maxHp' | 'manaRegen' | 'magicFind';
  currentLevel: number;
  maxLevel: number;
  unlocked: boolean;
  /** Prerequisite: other skill node IDs that must be unlocked first */
  requires?: string[];
}

// ─── Skill Tree ───
export interface SkillTree {
  name: string;
  className: string; // 'amazon' | 'rogue' | 'paladin' etc.
  passiveNodes: SkillNode[];
  combatSkills: CombatSkill[];
  unlocked: boolean;
}

// ─── Global Store ───
export const [skillTrees, setSkillTrees] = createStore<Record<string, SkillTree>>({
  amazon: {
    name: 'Amazon',
    className: 'amazon',
    passiveNodes: [
      { id: 'amazon_spear', name: 'Spear Mastery', description: '+10% spear damage per level', type: 'attack', bonusPerLevel: 0.10, statKey: 'strength', currentLevel: 0, maxLevel: 5, unlocked: true },
      { id: 'amazon_bow', name: 'Bow Mastery', description: '+10% bow damage per level', type: 'attack', bonusPerLevel: 0.10, statKey: 'strength', currentLevel: 0, maxLevel: 5, unlocked: true },
      { id: 'amazon_passive', name: 'Critical Strike', description: '+5% critical chance per level', type: 'passive', bonusPerLevel: 0.05, statKey: 'agility', currentLevel: 0, maxLevel: 5, unlocked: true },
    ],
    combatSkills: [
      // ── Jab (Amazon): 2 Mana, 3 hits, 0.8x per hit ──
      {
        id: 'amazon_jab',
        name: 'Jab',
        cost: 2,
        hits: 3,
        damageModifier: 0.8,
        effect: 'NONE',
        icon: '⚔️',
      },
    ],
    unlocked: false,
  },

  rogue: {
    name: 'Rogue Mercenary',
    className: 'rogue',
    passiveNodes: [
      { id: 'rogue_fire', name: 'Fire Arrow', description: '+15% fire damage per level', type: 'attack', bonusPerLevel: 0.15, statKey: 'strength', currentLevel: 0, maxLevel: 5, unlocked: true },
      { id: 'rogue_cold_passive', name: 'Cold Mastery', description: '+10% effect duration per level', type: 'passive', bonusPerLevel: 0.10, statKey: 'intellect', currentLevel: 0, maxLevel: 5, unlocked: true },
      { id: 'rogue_defense', name: 'Inner Sight', description: '-8% enemy defense per level', type: 'passive', bonusPerLevel: -0.08, statKey: 'defense', currentLevel: 0, maxLevel: 5, unlocked: true },
    ],
    combatSkills: [
      // ── Cold Arrow (Rogue Merc): 0 cost, CHILL, 30% slow, 3s ──
      {
        id: 'rogue_cold_arrow',
        name: 'Cold Arrow',
        cost: 0,
        hits: 1,
        damageModifier: 1.0,
        effect: 'CHILL',
        slowAmount: 0.3,
        duration: 3000,
        icon: '🧊',
      },
      // ── Fire Arrow: standard damage ──
      {
        id: 'rogue_fire_arrow',
        name: 'Fire Arrow',
        cost: 0,
        hits: 1,
        damageModifier: 1.2,
        effect: 'NONE',
        icon: '🔥',
      },
    ],
    unlocked: false,
  },

  paladin: {
    name: 'Paladin',
    className: 'paladin',
    passiveNodes: [
      { id: 'paladin_def', name: 'Defiance', description: '+12% defense per level', type: 'defense', bonusPerLevel: 0.12, statKey: 'defense', currentLevel: 0, maxLevel: 5, unlocked: true },
      { id: 'paladin_might', name: 'Might', description: '+10% damage per level', type: 'attack', bonusPerLevel: 0.10, statKey: 'strength', currentLevel: 0, maxLevel: 5, unlocked: true },
    ],
    combatSkills: [],
    unlocked: false,
  },
});

// ─── Skill Queries ───
/** Get a combat skill by ID across all trees. */
export function getCombatSkillById(skillId: string): CombatSkill | null {
  for (const tree of Object.values(skillTrees)) {
    const found = tree.combatSkills.find(s => s.id === skillId);
    if (found) return found;
  }
  return null;
}

/** Get all unlocked combat skills for a given class. */
export function getUnlockedCombatSkills(className: string): CombatSkill[] {
  const tree = skillTrees[className];
  if (!tree || !tree.unlocked) return [];
  return tree.combatSkills;
}

/** Get total passive bonus for a stat across all unlocked trees. */
export function getStatBonus(statKey: SkillNode['statKey']): number {
  let total = 0;
  for (const tree of Object.values(skillTrees)) {
    if (!tree.unlocked) continue;
    for (const node of tree.passiveNodes) {
      if (node.statKey === statKey && node.unlocked && node.currentLevel > 0) {
        total += node.bonusPerLevel * node.currentLevel;
      }
    }
  }
  return total;
}

// ─── Actions ───
export function unlockTree(treeName: string): boolean {
  const tree = skillTrees[treeName];
  if (!tree) return false;
  setSkillTrees(treeName, 'unlocked', true);
  // Unlock first passive node by default
  if (tree.passiveNodes.length > 0) {
    setSkillTrees(treeName, 'passiveNodes', 0, 'unlocked', true);
  }
  return true;
}

export function upgradePassiveNode(treeName: string, nodeId: string): boolean {
  const tree = skillTrees[treeName];
  if (!tree) return false;

  const nodeIdx = tree.passiveNodes.findIndex(n => n.id === nodeId);
  if (nodeIdx < 0) return false;

  const node = tree.passiveNodes[nodeIdx];
  if (node.currentLevel >= node.maxLevel) return false;

  // Check prerequisites
  if (node.requires) {
    for (const req of node.requires) {
      const reqNode = tree.passiveNodes.find(n => n.id === req);
      if (!reqNode || reqNode.currentLevel < 1) return false;
    }
  }

  setSkillTrees(treeName, 'passiveNodes', nodeIdx, 'currentLevel', node.currentLevel + 1);

  // Unlock next node in the chain
  if (nodeIdx + 1 < tree.passiveNodes.length) {
    setSkillTrees(treeName, 'passiveNodes', nodeIdx + 1, 'unlocked', true);
  }

  return true;
}
