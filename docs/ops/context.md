# CONTEXT & MEMORY MANAGEMENT
- **CHECKPOINTING:** Create BACKUP_LOG.md entries before major logic shifts if git is not immediate.
- **TRUNCATION:** If a task involves >3 files or >200 lines, break it into a step-by-step plan.
- **SESSION CONTINUITY:** Every response MUST end with a "Next Step" summary to maintain state across resets.
- **API SHIELD:** If "Rate increased too quickly" occurs, execute `sleep 60` immediately.
