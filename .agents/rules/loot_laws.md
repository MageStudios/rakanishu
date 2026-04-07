---
trigger: always_on
---

---
description: "Standardizes loot generation according to Mage Studios Law and xoshiro256**."
---

# Purity Laws
All agents must adhere to these itemization standards:

- **ALGORITHM**: Strictly use `xoshiro256**` with `BigUint64Array(4)`. Under no circumstances is `Math.random()` allowed in the logic.
- **NAMING**: Item name strings must contain NO brackets. Move any `[TAGS]` to the `item.quality` field.
- **VISUALS**: Quality 'low' items must use hex color `#696969`.
- **VALIDATION**: Any new loot table must include a 1,000-roll distribution check report.

# Enforcement
Block any task that attempts to import non-deterministic math libraries.