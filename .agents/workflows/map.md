---
trigger: always_on
---

---
name: map
description: "High-fidelity mapping of repository architecture and dependency graphs."
---

# Objective
Perform a cold-boot analysis of the current environment to ensure the agent is fully synchronized with the codebase.

# Process
1. **MAP**: Index file hierarchy and identify entry points (main, index, app). // turbo
2. **ARCH**: Define the technology stack, state management patterns, and data-flow vectors. // turbo
3. **REPORT**: Output a concise Technical Specification Document (TSD) summarizing findings as an Artifact.

# Assessment
- Does the report accurately reflect the current `playerStats.ts` integration?
- Are there any "orphan" files from the Goose migration?