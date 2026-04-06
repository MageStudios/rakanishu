/**
 * Verify the proposed fix for popNextActor.
 * The fix: cap accumulator at 2.0 to prevent runaway growth,
 * and when the first actor acts, check if any OTHER actor is
 * also ready (>= 1.0) and give them priority next time.
 */

// Copy of the broken original logic:
function popNextActorBROKEN(queue: { combatant: string; priority: number; accumulator: number }[]):
  { actor: string; accumulator: { player: number; enemy: number }; queue: typeof queue } {
  const incremented = queue.map(e => ({
    ...e,
    accumulator: e.accumulator + e.priority / Math.max(1, ...queue.map(e => e.priority)),
  }));
  for (let i = 0; i < incremented.length; i++) {
    if (incremented[i].accumulator >= 1.0) {
      const updated = [...incremented];
      updated[i] = { ...updated[i], accumulator: updated[i].accumulator - 1.0 };
      return { actor: updated[i].combatant, accumulator: { player: updated[0].accumulator, enemy: updated[1].accumulator }, queue: updated };
    }
  }
  return { actor: 'none', accumulator: { player: incremented[0].accumulator, enemy: incremented[1].accumulator }, queue: incremented };
}

// Fixed logic: cap accumulators at 2.0, and after acting, check if
// other actors are also ready — if so, process the OTHER one first.
function popNextActorFIXED(queue: { combatant: string; priority: number; accumulator: number }[]):
  { actor: string; accumulator: { player: number; enemy: number }; queue: typeof queue } {
  const maxPriority = Math.max(1, ...queue.map(e => e.priority));
  const incremented = queue.map(e => ({
    ...e,
    accumulator: Math.min(2.0, e.accumulator + e.priority / maxPriority),
  }));

  // Find which actor is most ready (highest accumulator) among those >= 1.0
  let bestIdx = -1;
  let bestAcc = 0;
  for (let i = 0; i < incremented.length; i++) {
    if (incremented[i].accumulator >= 1.0 && incremented[i].accumulator > bestAcc) {
      bestAcc = incremented[i].accumulator;
      bestIdx = i;
    }
  }

  if (bestIdx >= 0) {
    const updated = [...incremented];
    updated[bestIdx] = { ...updated[bestIdx], accumulator: updated[bestIdx].accumulator - 1.0 };
    return { actor: updated[bestIdx].combatant, accumulator: { player: updated[0].accumulator, enemy: updated[1].accumulator }, queue: updated };
  }

  return { actor: 'none', accumulator: { player: incremented[0].accumulator, enemy: incremented[1].accumulator }, queue: incremented };
}

const initialQueue = [
  { combatant: 'player', priority: 3, accumulator: 0 },
  { combatant: 'enemy', priority: 2, accumulator: 0 },
];

console.log('=== BROKEN (original) ===');
let q = JSON.parse(JSON.stringify(initialQueue));
for (let t = 1; t <= 12; t++) {
  const r = popNextActorBROKEN(q);
  q = r.queue;
  console.log(`T${t}: actor="${r.actor}" P=${r.accumulator.player.toFixed(3)} E=${r.accumulator.enemy.toFixed(3)}`);
}

console.log('\n=== FIXED (cap + best-actor) ===');
let q2 = JSON.parse(JSON.stringify(initialQueue));
for (let t = 1; t <= 12; t++) {
  const r = popNextActorFIXED(q2);
  q2 = r.queue;
  console.log(`T${t}: actor="${r.actor}" P=${r.accumulator.player.toFixed(3)} E=${r.accumulator.enemy.toFixed(3)}`);
}
