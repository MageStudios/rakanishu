# CONTEXT & MEMORY MANAGEMENT
- **CHECKPOINTING:** Create BACKUP_LOG.md entries before major logic shifts if git is not immediate.
- **TRUNCATION:** If a file is >100 lines (e.g., monsters.ts), you are FORBIDDEN from overwriting the whole file.
- **SESSION CONTINUITY:** Every response MUST end with a "Next Step" summary to maintain state across resets.
- **API SHIELD:** If "Rate increased too quickly" occurs, execute `sleep 60` immediately.
