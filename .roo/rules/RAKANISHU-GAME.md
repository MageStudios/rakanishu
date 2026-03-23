# Rakanishu Game-Specific Rules

**PREREQUISITE:** Read `.roo/rules/SOLID-MASTER.md` first for core SolidJS patterns.

This file contains **game-specific architecture** unique to Rakanishu (UI layout, persistence, game systems).

---

## [1. UI LAYOUT REQUIREMENTS]

### Dashboard Structure (Non-Negotiable)
```typescript
// MANDATORY 3-column layout:
<div class="h-screen overflow-hidden bg-[#0a0a0a] flex">
  {/* Left Column - Player Stats */}
  <div class="w-1/4 overflow-y-auto">
    <PlayerStats />
  </div>
  
  {/* Center Column - Combat */}
  <div class="w-1/2 flex flex-col">
    <EnemyDisplay />
    <CombatLog />
  </div>
  
  {/* Right Column - Loot/Inventory */}
  <div class="w-1/4 overflow-y-auto">
    <LootLog />
    <Inventory />
  </div>
</div>
```

### Layout Rules:
- **Root container:** `h-screen overflow-hidden` (prevents page scroll)
- **Scrolling columns:** ONLY add `overflow-y-auto` to columns that need scrolling (Loot Log, Inventory)
- **Combat area:** NEVER scrolls (stays fixed in viewport)
- **Widths:** Left 25%, Center 50%, Right 25%

### Forbidden Patterns:
- ❌ Bootstrap grid system
- ❌ External CSS files
- ❌ Percentage width strings (`w-20%`)
- ❌ Page-level scrolling

---

## [2. GAME SYSTEMS ARCHITECTURE]

### Assistants vs. Hirelings (CRITICAL DISTINCTION)

**Permanent Assistants** (unlockable utilities):
- Auto-Seller (sells normal items for gold)
- Potion-Giver (auto-heals at low HP)
- **DO NOT use hireling slots** (these are permanent unlocks)
- Stored in `player.assistants: Assistant[]`

**Hirelings** (temporary combat allies):
- Fighter (deals damage)
- Merchant (gold multiplier)
- Max 3 active at once
- Stored in `player.hirelings: Hireling[]` (max length: 3)

### Assistant Trigger Pattern:
```typescript
// Check assistants INSIDE combat/death handlers:
function handleEnemyDeath(enemy: Enemy) {
  // Drop loot logic...
  
  // Check for Auto-Seller assistant:
  const autoSeller = gameState.player.assistants.find(a => 
    a.type === "auto-seller" && a.active
  );
  
  if (autoSeller && item.rarity === "normal") {
    // Auto-sell instead of adding to inventory
    setGameState("player", "gold", g => g + item.value);
  }
}
```

---

## [3. PERSISTENCE & AUTO-SAVE]

### LocalStorage Integration
```typescript
import { createEffect } from "solid-js";
import { reconcile } from "solid-js/store";

// Auto-save on every state change:
createEffect(() => {
  const saveData = {
    version: 1, // REQUIRED for future migrations
    player: gameState.player,
    enemies: gameState.enemies,
    timestamp: new Date().toISOString()
  };
  
  localStorage.setItem("rakanishu-save", JSON.stringify(saveData));
});

// Load on startup:
const saved = localStorage.getItem("rakanishu-save");
if (saved) {
  const data = JSON.parse(saved);
  
  // Use reconcile to preserve reactivity:
  setGameState(reconcile(data));
}
```

### Serialization Rules:
- **Dates:** Store as ISO strings (`toISOString()`), parse back to `Date` objects
- **Version:** ALWAYS include version number for migrations
- **Reconcile:** Use `reconcile()` when hydrating nested objects/arrays from JSON

---

## [4. COMBAT LOOP SPECIFICS]

### Whirlwind AOE Pattern (Already in SOLID-MASTER.md)
Refer to SOLID-MASTER.md section [4. GAME LOOP & PERFORMANCE] for:
- `batch()` usage
- `setInterval` + `onCleanup`
- Fixed 100ms timestep

**Game-specific addition:**
```typescript
// Combat targets ALL enemies with hp > 0:
batch(() => {
  for (let i = 0; i < gameState.enemies.length; i++) {
    const enemy = gameState.enemies[i];
    
    // Skip dead enemies:
    if (enemy.hp <= 0) continue;
    
    // Apply AOE damage:
    const damage = Math.floor(gameState.player.damage);
    setGameState("enemies", i, "hp", hp => Math.max(0, hp - damage));
  }
});
```

---

## [5. UI FRAMEWORK: TAILWIND ONLY]

### Banned Libraries:
- ❌ Bootstrap
- ❌ jQuery
- ❌ Material-UI
- ❌ Ant Design
- ❌ Any external CSS files

### Required Approach:
- ✅ Tailwind utility classes ONLY
- ✅ Gothic hex colors (see SOLID-MASTER.md section [5. GRIMDARK DESIGN SYSTEM])
- ✅ Inline `style={{}}` for dynamic values (HP bars, percentages)

### Example (HP Bar):
```typescript
// ✅ CORRECT (Tailwind + inline style):
<div class="w-full bg-[#2a2a2a] h-4">
  <div 
    class="bg-[#8a0000] h-full transition-all"
    style={{ width: `${(props.hp / props.maxHp) * 100}%` }}
  />
</div>

// ❌ WRONG (Bootstrap):
<div class="progress">
  <div class="progress-bar bg-danger" style="width: 50%"></div>
</div>
```

---

## [6. QUICK GAME-SPECIFIC CHECKLIST]

Before submitting game code, verify:

- [ ] UI is 3-column `h-screen overflow-hidden` layout?
- [ ] Only Loot/Inventory columns have `overflow-y-auto`?
- [ ] Assistants stored separately from Hirelings?
- [ ] Auto-save includes `version` field?
- [ ] Using `reconcile()` when loading from localStorage?
- [ ] Combat loop targets all `hp > 0` enemies?
- [ ] NO Bootstrap/jQuery/external CSS?
- [ ] Tailwind utilities + gothic hex colors only?

**If ANY box is unchecked, STOP and fix before proceeding.**

---

**End of RAKANISHU-GAME.md**

This supplements SOLID-MASTER.md with game architecture. Read both before building features.
