---
description: 
---

---
name: perf
description: "Deep-trace analysis of execution loops and resource allocation."
---

# Objective
Execute a reliability diagnostic on the primary execution logic.

# Process
1. **SCOPE**: Analyze core loops for timing drift or memory leaks.
2. **VALIDATION**: Verify mathematical operations are deterministic (PRNG check).
3. **DIAGNOSTIC**: Run performance benchmarks via developer shell. // turbo
4. **REPORT**: Identify "Knowledge Debt" in execution paths.

# Assessment
- Is the combat loop drifting during high-density monster spawns?