// Combat System Implementation
// Phase 3: Core Loop with Xoshiro256++ PRNG Integration
import { BattleState, EnemyDefinition } from '../combatState'
// Import Xoshiro256++ PRNG instance from CombatState
import { xoshiro256 } from '../combatState'

// Module-Level Persistent State (The Law: No destructuring)
const moduleState = {
  activeCombatInstanceId: null,
  combatConfig: {
    baseDamageMin: 2,
    baseDamageMax: 8,
    critThreshold: {
      physical: 0.15, // 15% base
      magic: 0.25     // 25% base
    }
  }
}

// Export the singleton module
const CombatSystem = (function() {
  
  // ============================================================
  // STATE ACCESSORS (Path-Based: NO DESTRUCTURING)
  // ============================================================
  
  function getCombatConfig() {
    return moduleState.combatConfig
  }
  
  function setCombatConfig(key: string, value: number) {
    moduleState.combatConfig[key] = value
  }
  
  function getActiveCombatInstanceId() {
    return moduleState.activeCombatInstanceId
  }
  
  // ============================================================
  // PRNG UTILITIES (Xoshiro256++)
  // ============================================================
  
  function randomInt32(rng: { next(): number }) {
    return rng.next() & 0x7FFFFFFF
  }
  
  function randomInt(rng: { next(): number }, min: number, max: number) {
    return Math.floor(rng.next() % (max - min + 1)) + min
  }
  
  function randomFloat(rng: { next(): number }, max: number) {
    return rng.next() / (max << 1)
  }
  
  function weightedRandomChoice<R>(rng: { next(): number }, options: R[]): R {
    const index = randomInt(rng, 0, options.length - 1)
    return options[index]
  }
  
  // ============================================================
  // DAMAGE CALCULATION (Path-Based State Access)
  // ============================================================
  
  export function calculateDamage(attacker: any, defender: EnemyDefinition, rng: { next(): number }) {
    // Base weapon range
    const baseRange = moduleState.combatConfig.baseDamageMin + (moduleState.combatConfig.baseDamageMax - moduleState.combatConfig.baseDamageMin)
    
    // Variance from RNG
    const variance = (randomInt(rng, -2, 2) * baseRange) / 10
    let rawDamage = Math.floor(baseRange + variance)
    
    // Clamp to prevent negatives
    const clampedDamage = Math.max(moduleState.combatConfig.baseDamageMin, rawDamage)
    
    // Critical Hit Check
    const type = defender.type === 'PHYSICAL' ? 'physical' : 'magic'
    const critChance = moduleState.critThreshold[type]
    
    // Roll critical hit
    const roll = randomFloat(rng, 100)
    let finalDamage = clampedDamage
    let isCrit = false
    
    if (roll < critChance) {
      const critMultiplier = 2.5
      finalDamage = Math.floor(clampedDamage * critMultiplier)
      isCrit = true
    }
    
    // Defense Mitigation (simplified)
    const mitigation = defender.defense * 0.1
    finalDamage = Math.max(1, finalDamage - mitigation)
    
    return {
      damage: finalDamage,
      isCrit: isCrit,
      type
    }
  }
  
  // ============================================================
  // COMBAT RESOLUTION (Tick-Driven)
  // ============================================================
  
  export async function resolveCombatRound(state: BattleState, rng: { next(): number }) {
    return new Promise(resolve => {
      // Phase transitions controlled by ticker
      if (state.phase === 'INCOMING') {
        setTimeout(() => resolve({ ...state, phase: 'ENGAGED' }), 100)
      } else if (state.phase === 'FINISHED') {
        resolve({ ...state, phase: 'INCOMING' })
      } else {
        resolve(state)
      }
    })
  }
  
  export async function processCombatLoop(state: BattleState, rng: { next(): number }) {
    let turn = 0
    const maxTurns = 100 // Safety brake to prevent infinite loops
    
    while (state.phase === 'ENGAGED' && turn < maxTurns) {
      
      // AUTO-PLAYER ACTION (Ticker-driven, no manual input)
      if (!state.damageLog.find(d => d.source === 'Player')) {
        state.damageLog.push({
          turn,
          source: 'Player',
          target: state.enemy.name,
          value: calculateDamage(state.player, state.enemy, rng).damage,
          type: 'PHYSICAL'
        })
      }
      
      // ENEMY AI RESPONSE (Ticker-driven)
      if (state.phase !== 'INCOMING') {
        const lastEnemyHit = state.damageLog.find(d => d.target === 'Player' && !d.source.includes('Player'))
        
        if (lastEnemyHit) {
          const damageFromLast = lastEnemyHit.value
          state.player.hp = Math.max(0, state.player.hp - damageFromLast)
        }
      }
      
      // Check player death
      if (state.player.hp <= 0) {
        state.phase = 'FINISHED'
        break
      }
      
      // Advance to next phase transition
      if (state.phase === 'FINISHED') {
        state.phase = 'INCOMING'
      }
      
      turn++
      await resolveCombatRound(state, rng)
    }
    
    return state
  }
  
  // ============================================================
  // ENEMY AI (Deterministic based on state, not random)
  // ============================================================
  
  export function resolveEnemyAI(state: BattleState) {
    // Simple AI: Immediate retaliation after taking damage
    const lastHit = state.damageLog.find(d => d.target === 'Player' && !d.source.includes('Player'))
    
    if (lastHit) {
      return {
        action: 'RETALIATE',
        targetId: state.player.hp > 0 ? 'player' : null,
        damageDealt: calculateDamage(state.enemy, state.player, xoshiro256).damage,
        cooldown: 0
      }
    }
    
    // If no damage taken, prepare incoming strike
    return {
      action: 'PREPARE',
      targetId: null,
      damageDealt: 0,
      cooldown: state.phase === 'INCOMING' ? 5 : 2
    }
  }
  
  // ============================================================
  // TIGGER MANAGEMENT (Module-level hooks)
  // ============================================================
  
  export function startCombatSession(config: any) {
    moduleState.activeCombatInstanceId = `session_${Date.now()}`
  }
  
  export function endCombatSession() {
    moduleState.activeCombatInstanceId = null
  }
  
  return CombatSystem
  
})();

export default CombatSystem
