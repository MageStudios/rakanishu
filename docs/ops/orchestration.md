# ORCHESTRATION & GIT WORKFLOW

## 1. GIT FLOW (THE GEARS)
- **PRE-FLIGHT:** Before any task, `git checkout master` && `git pull`.
- **ISOLATION:** Every feature/fix starts with `git checkout -b feature/[name]`.
- **ATOMIC COMMITS:** Only `git add` and `git commit` once a sub-goal is verified via `npx tsc --noEmit`.
- **BRANCH CLEANUP:** Once merged to master, delete the local feature branch to prevent "Branch Bloat."
- **THE HANDOVER:** Every completed task MUST update `PLAN.md` to reflect the new state of the world.

## 2. RECOVERY & SAFETY (THE BRAKES)
- Rollback after 2 failed builds.
- Use DUMP.txt for Rate Limit survival.

## 3. QUALITY ASSURANCE (THE SCALE)
- Perform "100-Drop" simulations for loot changes.
- Ensure Gothic ID Purity (SCREAMING_SNAKE_CASE).

## 4. OPENROUTER/FREE
- If using openrouter/free and a 429 error occurs, wait 10 seconds before retrying.