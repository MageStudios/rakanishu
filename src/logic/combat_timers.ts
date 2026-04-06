/* @refresh reload */
/**
 * Warband Action Engine — Multi-Track Delta Timer System
 *
 * 5 independent PartyMembers tick their cooldowns against the game loop's
 * delta time.  At zero → fire a Decimal-based damage "Ballad" event and reset.
 * Auras modify the effective cooldown multiplicatively.
 */

import Decimal from 'break_infinity.js';

// ─── Aura Modifier ────────────────────────────────────────────────
// Placeholder: each aura reduces cooldown time multiplicatively.
// e.g. Fanaticism Aura → 0.60 (40% faster attacks)

export interface Aura {
  id: string;
  name: string;                // "Fanaticism", "Concentration", "Defiance"
  cooldownFactor: number;      // < 1.0 speeds up, > 1.0 slows down
}

// ─── PartyMember ──────────────────────────────────────────────────

export class PartyMember {
  public remainingMs: number;        // ms until next action
  public readonly baseCooldownMs: number;
  public auras: Aura[] = [];
  public totalActions: number = 0;

  /**
   * @param name           — display name ("Shakira", "Kyra", …)
   * @param baseDmg        — base damage as Decimal
   * @param actionCooldownMs — default 6000ms between actions
   * @param attackType     — 'PHYSICAL' | 'MAGIC'
   */
  constructor(
    public readonly name: string,
    public baseDmg: Decimal,
    actionCooldownMs: number = 6000,
    public attackType: 'PHYSICAL' | 'MAGIC' = 'PHYSICAL',
  ) {
    this.baseCooldownMs = actionCooldownMs;
    this.remainingMs = 0; // start ready-to-act
  }

  /** Compute effective cooldown after all active aura factors. */
  getEffectiveCooldown(): number {
    const factor = this.auras.reduce(
      (acc, a) => acc * a.cooldownFactor,
      1.0,
    );
    return Math.round(this.baseCooldownMs * factor);
  }

  /** Check if this member is ready to act. */
  isReady(): boolean {
    return this.remainingMs <= 0;
  }

  /**
   * Apply aura list, replacing previous auras.
   * Cooldown takes effect on next reset cycle.
   */
  setAuras(newAuras: Aura[]): void {
    this.auras = [...newAuras];
  }
}

// ─── Ballad Event (damage fired when timer hits 0) ────────────────

export interface BalladEvent {
  source: string;
  type: 'PHYSICAL' | 'MAGIC';
  damage: Decimal;
  effectiveCooldown: number; // ms of the cycle that fired
}

// ─── Warband Action Engine (multi-track) ──────────────────────────

export class WarbandEngine {
  public members: PartyMember[] = [];
  public events: BalladEvent[] = [];

  addMember(m: PartyMember): this {
    this.members.push(m);
    return this;
  }

  /**
   * Tick once — called from the game loop with delta in ms.
   * Reduces each member's remainingMs, fires BalladEvents when ready.
   */
  tick(deltaMs: number): BalladEvent[] {
    this.events = [];

    for (const m of this.members) {
      // Already ready → trigger a Ballad, then reset
      if (m.isReady()) {
        const effCd = m.getEffectiveCooldown();
        const damage = m.baseDmg; // future: multiply by auras/stats
        m.totalActions += 1;
        this.events.push({
          source: m.name,
          type: m.attackType,
          damage,
          effectiveCooldown: effCd,
        });
        m.remainingMs = effCd; // reset to full cooldown
      }

      // Tick the countdown
      if (m.remainingMs > 0) {
        m.remainingMs = Math.max(0, m.remainingMs - deltaMs);
      }
    }

    return this.events;
  }
}
