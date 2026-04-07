---
trigger: always_on
---

---
name: test
description: "Adversarial testing and edge-case validation."
---

# Objective
Execute an adversarial audit to identify bugs or brittle logic in the latest implementation.

# Process
1. **ADVERSARIAL**: Attempt to "break" state transitions via edge-case analysis.
2. **COVERAGE**: Verify that all new logic (e.g., Accuracy/Immunity) has validation logic.
3. **SHELL**: Execute unit tests or manual state-injection scripts via terminal. // turbo
4. **REPORT**: List "At-Risk" areas and required hardening steps.

# Assessment
- Are the Act 2 Resistances properly clamped?