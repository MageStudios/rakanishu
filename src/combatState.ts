// Ticker system for auto-battle resolution
// NO MANUAL INTERVENTION - This is a passive observation engine
import { on } from 'solid-js'

export type BattlePhase = 
  | "INCOMING"      // Enemy detected, preparing strike
  | "ENGAGED"       // Active combat loop
  | "RESOLVING"     // Damage calculation, crit check
  | "FINISHED"      // Turn complete, next phase eval

export interface BattleState {
  player: PlayerStats
  enemy: EnemyDefinition
  phase: BattlePhase
  incomingQueue: string[]       // New enemies arriving (tick-driven)
  damageLog: DamageEvent[]      // Recent combat history
}

interface PlayerStats {
  hp: number
  maxHp: number
  strength: number      // Melee potency
  agility: number       // Crit chance & evasion
  intellect: number     // Magic potency
}

interface EnemyDefinition {
  name: string
  hp: number
  maxHp: number
  defense: number       // Reduces incoming damage
  type: 'PHYSICAL' | 'MAGIC'
}

interface DamageEvent {
  turn: number
  source: string          // "Player" | Enemy Name
  target: string         // Opposite of source
  value: number          // Damage dealt or taken
  type: 'PHYSICAL' | 'MAGIC'
}

export function runCombatCycle(state: BattleState) {
  return new Promise(resolve => {
    // Phase transitions are strictly ticker-controlled
    if (state.phase === 'INCOMING') {
      setTimeout(() => resolve({ ...state, phase: 'ENGAGED' }), 100)
    } else if (state.phase === 'FINISHED') {
      resolve({ ...state, phase: 'INCOMING' })
    } else {
      resolve(state)
    }
  })
}

// ==============================
// AUTO-RESOLUTION ENGINE (NO CLICK)
// ==============================
export async function autoResolutionLoop(st: BattleState) {
  let turn = 0
  const maxTurns = 999 // Safety brake
  
  while (st.phase === 'ENGAGED' && turn < maxTurns) {
    // Player Action (Auto-calculated)
    if (!st.damageLog.find(d => d.source.includes('Player'))) {
      st.damageLog.push({
        turn: turn,
        source: 'Player',
        target: st.enemy.name,
        value: calculateDamage(st.player, st.enemy),
        type: 'PHYSICAL'
      })
    }
    
    // Enemy Counter
    if (st.phase === 'FINISHED') {
      st.phase = 'INCOMING'
    } else if (!st.damageLog.find(d => d.target.includes(st.enemy.name) && !d.source.includes('Player'))) {
      st.damageLog.push({
        turn: turn,
        source: st.enemy.name,
        target: 'Player',
        value: calculateDamage(st.enemy, st.player),
        type: 'MAGIC'
      })
    }
    
    turn++
    await runCombatCycle(st)
  }
  
  return st
}

// ==============================
// DAMAGE MECHANICS
// ==============================
function calculateDamage(attacker: PlayerStats, defender: EnemyDefinition) {
  // Base weapon damage (static for now)
  let raw = 10 + Math.floor(Math.random() * 5) // RNG variance
  
  // Critical Hit Check (Agility-based)
  const critChance = Math.min(attacker.agility / 10, 5) // Max 5% to keep it spicy
  if (Math.random() * 100 < critChance) {
    raw = Math.floor(raw * 2.5)
    return { damage: raw, isCrit: true }
  }
  
  // Defense Mitigation (Tier-based)
  const mitigation = defender.defense * 0.1
  const finalDamage = Math.max(raw - mitigation, 1)
  
  return { damage: finalDamage, isCrit: false }
}

export function updatePlayerHealth(damage: number) {
  return Math.max(0, Math.min(damage)) // Clamp positive
}
