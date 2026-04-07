# SCALING & BESTIARY (ACTS 1-5)

## 1. The Piecewise Generator
Logic in `src/data/scalingTable.ts`. Piecewise exponential curves anchored at D2 milestones (Lvl 1, 36, 67, 110).
- **Formula:** `finalStat = getBaseStats(level).stat × (ratio / 100) × difficultyMult × partyScaling`.

## 2. Scaling Laws (The Juice & The Meat)
- **THE JUICE (Experience):** `XP Multiplier = 1 + (partySize - 1) × 1.75`.
- **THE MEAT (HP):** `HP Multiplier = 1 + (partySize - 1) × 1.75`.
- **NOTE:** AC and Damage remain at `1.0x` party multiplier.
- **LOCKING:** Monster HP and XP are calculated and locked at the moment of spawning.

## 3. Supported Bestiary (Families)
- **ACT 1:** FALLEN, ZOMBIE, QUILL_RAT, DARK_ARCHER, TAINTED.
- **ACT 2:** SCARAB_DEMON, SAND_MAGGOT, GREATER_MUMMY, DRIED_CORPSE, CLAW_VIPER, SABRE_CAT.
- **ACT 3:** FETISH, ZAKARUMITE, COUNCIL_MEMBER, THORN_HULK.
- **ACT 4:** FINGER_MAGE, MEGADEMON, OBLIVION_KNIGHT.
- **ACT 5:** ENSLAVED, DEATH_MAULER, OVERSEER, MINION_OF_DESTRUCTION.
