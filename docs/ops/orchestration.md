# ORCHESTRATION & GIT WORKFLOW

## 1. GIT FLOW (THE GEARS)
- **PRE-FLIGHT:** Before any task, `git checkout master` && `git pull`.
- **ISOLATION:** Every feature/fix starts with `git checkout -b feature/[name]`.
- **ATOMIC COMMITS:** Only `git add` and `git commit` once a sub-goal is verified via `npx tsc --noEmit`.
- **ATOMIC LOOP:** ALL sub-tasks MUST follow: Edit → `npx tsc --noEmit` → `git add/commit` → Update `PLAN.md`. NEVER ask for permission to commit if the build is green.
- **MERGE QUEUE PROTOCOL:** `git checkout master` → `git pull origin master` → `git checkout [feature]` → `git rebase master`. If `tsc` still GREEN → `git checkout master` → `git merge [feature]` → `git push origin master` → delete feature branch.
- **BRANCH CLEANUP:** Once merged to master, delete the local feature branch to prevent "Branch Bloat."
- **THE HANDOVER:** Every completed task MUST update `PLAN.md` to reflect the new state of the world.

## 2. RECOVERY & SAFETY (THE BRAKES)
- Rollback after 2 failed builds.
- Use DUMP.txt for Rate Limit survival.

## 3. QUALITY ASSURANCE (THE SCALE)
- Perform "100-Drop" simulations for loot changes.
- Ensure Gothic ID Purity (SCREAMING_SNAKE_CASE).
