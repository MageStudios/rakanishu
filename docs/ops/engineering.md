# ENGINEERING STANDARDS
- **NO DESTRUCTURING:** Never destructure props, state, or gameState. It breaks SolidJS reactivity instantly.
- **DRY/MOIST:** Pure logic functions; "moist" state objects with full metadata (e.g., item.quality).
- **PRNG DISCIPLINE:** xoshiro256** calls MUST originate from logic/tick functions. NEVER from UI effects or render paths.
- **CIRCULAR CHECK:** Components must NEVER import from gameState.ts if they are imported BY it.
- **4GB RULE:** Always run vitest with --max-old-space-size=4096.
