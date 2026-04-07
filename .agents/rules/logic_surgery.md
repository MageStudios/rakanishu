---
trigger: always_on
---

---
description: "Precision state management and business logic safety laws."
---

# Constraints
- **DETERMINISM**: Maintain absolute state determinism. No side effects in core math.
- **NON-BREAKING**: Refactors must be behavior-neutral. 
- **VERIFICATION**: Validate all logic edits in the developer shell before finalizing.
- **SYNC**: Align with the "Executive Charter" for Store migration (no loose Signals).

# Enforcement
Block any code that introduces non-deterministic logic into the combat engine.