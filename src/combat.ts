// ==============================
// EPHEMERAL COMBAT ENGINE
// ==============================
import { createSignal } from 'solid-js'

export type CombatLog = {
  id: string
  timestamp: number
  message: string
  source?: string
}

export type Enemy = {
  id: string
  name: string
  hp: number
  maxHp: number
  damage: number // calculated from stats
}

// Combat state (ephemeral - resets per battle)
const [combatState, setCombat] = createSignal({
  active: false,
  enemy: null as Enemy | null,
  log: [] as CombatLog[],
  phase: 'IDLE' // IDLE | ENGAGED | RESOLVE
}) as const

export function initializeEnemy(enemyData: { name: string; maxHp: number }) {
  const enemy = {
    id: crypto.randomUUID(),
    ...enemyData,
    hp: enemyData.maxHp,
    damage: Math.floor(enemyData.maxHp * 0.5) // placeholder calculation
  }
  
  setCombat(prev => ({
    ...prev,
    active: true,
    enemy,
    phase: 'ENGAGED',
    log: [
      { id: crypto.randomUUID(), timestamp: Date.now(), message: `Wild ${enemy.name} spotted!` }
    ]
  }))
}

export function resolveCombatRound(attackerStats: { strength: number }, defenderHp: number) {
  // Simple D20-based resolution on next tick
  const roll = Math.random() * 100 // Placeholder - real impl uses PRNG
  const hitThreshold = 50 + (attackerStats.strength * 2)
  
  setTimeout(() => {
    setCombat(prev => ({
      ...prev,
      phase: 'RESOLVE',
      log: [...prev.log, {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        message: `You rolled ${roll}.`,
        source: 'Player Action'
      }]
    }))
  }, 50)
}

// ==============================
// TICKER-DRIVEN COMBAT LOOP
// ==============================
export function combatLoop() {
  // Tick every frame (requestAnimationFrame)
  const tick = () => {
    const { phase } = combatState()
    
    if (phase === 'RESOLVE') {
      // Damage calculation would go here
      setCombat(prev => ({
        ...prev,
        phase: 'RECOVERY',
        log: [...prev.log, {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          message: `Enemy takes damage!`
        }]
      }))
    }
  }

  requestAnimationFrame(tick)
}
