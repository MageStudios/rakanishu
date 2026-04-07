---
trigger: always_on
---

---
name: save
description: "Synthesis of technical state and architectural progress for session handoff."
---

# Objective
Generate a high-fidelity "Save Point" of the current project state.

# Process
1. **AUDIT**: Trace the session history and repository modifications.
2. **DOCUMENT**: 
   - Define the primary mission and completion %.
   - List modified files with specific logic changes in a Markdown table.
   - Identify "Knowledge Debt" (unresolved bugs or TODOs).
3. **PLAN**: Provide an actionable 3-step roadmap for the next session.

# Assessment
- Is the roadmap clear enough for a fresh agent to resume work immediately?