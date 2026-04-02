import { createEffect, createMemo } from 'solid-js';
import { setGameState } from './gameState';

// Define Skill Tree Interface
interface Skill {
  id: string;
  name: string;
  description: string;
  type: 'attack' | 'defense' | 'passive' | 'utility';
  cost: number; // Cost in gold or experience
  baseValue: number;
  multiplier: number; // Multiplier applied to stats
  active: boolean;
  level: number; // Level of the skill (1-5)
}

// Define Skill Tree Structure (e.g., 'Attack Tree')
interface SkillTree {
  name: string;
  description: string;
  skills: Skill[];
  unlocked: boolean;
  level: number; // 1-5
}

// Global Skill Tree State
export const [skillTreeState, setSkillTreeState] = createStore<Record<string, SkillTree>>({
  'attack': {
    name: 'Attack Power',
    description: 'Enhance your attack strength and damage output.',
    skills: [
      {
        id: 'attack1',
        name: 'Fist Strike',
        description: 'Basic melee attack with increased damage.',
        type: 'attack',
        cost: 50,
        baseValue: 10,
        multiplier: 1.2,
        active: false,
        level: 1
      },
      {
        id: 'attack2',
        name: 'Rage Attack',
        description: 'Deal extra damage when HP is below 30%.',
        type: 'attack',
        cost: 100,
        baseValue: 15,
        multiplier: 1.5,
        active: false,
        level: 1
      }
    ],
    unlocked: true,
    level: 1
  },
  'defense': {
    name: 'Defense Mastery',
    description: 'Improve your defense and reduce incoming damage.',
    skills: [
      {
        id: 'defense1',
        name: 'Shield Block',
        description: 'Block incoming attacks with a shield.',
        type: 'defense',
        cost: 75,
        baseValue: 5,
        multiplier: 0.8,
        active: false,
        level: 1
      }
    ],
    unlocked: true,
    level: 1
  }
});

// Function to upgrade a skill
export function upgradeSkill(skillId: string, skillTreeName: string, amount: number) {
  const tree = skillTreeState[skillTreeName];
  if (!tree) return;
  
  const skill = tree.skills.find(s => s.id === skillId);
  if (!skill) return;
  
  // Apply level up logic
  const newLevel = Math.min(5, skill.level + amount);
  const newBaseValue = skill.baseValue * (1 + (newLevel - 1) * skill.multiplier);
  
  // Update skill level and value
  setGameState('player', (player) => ({
    ...player,
    stats: {
      ...player.stats,
      attack: player.stats.attack + newBaseValue,
      defense: player.stats.defense + (newBaseValue * 0.5)
    }
  }));
  
  // Update skill in tree
  skill.level = newLevel;
  skill.baseValue = newBaseValue;
}

// Function to check if a skill is available for upgrade
export function canUpgradeSkill(skillId: string, skillTreeName: string): boolean {
  const tree = skillTreeState[skillTreeName];
  if (!tree) return false;
  
  const skill = tree.skills.find(s => s.id === skillId);
  if (!skill) return false;
  
  // Check if player has enough gold or XP
  return player.gold >= skill.cost || player.xp >= skill.cost;
}

// Function to toggle skill activation
export function toggleSkillActivation(skillId: string, skillTreeName: string) {
  const tree = skillTreeState[skillTreeName];
  if (!tree) return;
  
  const skill = tree.skills.find(s => s.id === skillId);
  if (!skill) return;
  
  skill.active = !skill.active;
}

// Function to get current player stats based on skill tree
export function getPlayerStatsFromSkillTree(): { attack: number; defense: number } {
  const stats = { attack: 0, defense: 0 };
  
  // Apply all active skills
  for (const tree of Object.values(skillTreeState)) {
    for (const skill of tree.skills) {
      if (skill.active) {
        stats.attack += skill.baseValue * skill.multiplier;
        stats.defense += skill.baseValue * skill.multiplier * 0.5;
      }
    }
  }
  
  return stats;
}

// Function to update player stats when skill tree changes
export function updatePlayerStats() {
  const stats = getPlayerStatsFromSkillTree();
  setGameState('player', (player) => ({
    ...player,
    stats: {
      ...player.stats,
      attack: player.stats.attack + stats.attack,
      defense: player.stats.defense + stats.defense
    }
  }));
}

// Effect to automatically update player stats on skill changes
createEffect(() => {
  updatePlayerStats();
});

// Initial effect to set up skill tree on load
createEffect(() => {
  setGameState('player', (player) => ({
    ...player,
    stats: {
      ...player.stats,
      attack: 10,
      defense: 5
    }
  }));
