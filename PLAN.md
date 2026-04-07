# RAKANISHU PROJECT PLAN

## Completed Milestones

- [x] State architecture migration to module-level stores
- [x] Xoshiro256** PRNG implementation
- [x] Spatial inventory (10×4 grid) with canPlace/drop
- [x] Equipment paper doll with type gates
- [x] Combat ticker system
- [x] Loot table system
- [x] Holy Bolt auto-sustain
- [x] MultiplierRegistry for Prestige Layer 1
- [x] Hero Registry (Shakira + Kaelan)
- [x] Math engine (formulas.ts)
- [x] D2-style XP calc with 3-tier penalty
- [x] **Monster Scaling Engine** — Piecewise generator + ratio blueprints
- [x] Data purity (no bracketed tags in names)

## Active Milestones

- [ ] Combat loop integration with scaleMonster() (58 tests green, expect values aligned)
- [x] **Item Affix/Prefix/Suffix Generator** — Dynamic affix rolls from TCs

## Completed Milestones

- [x] **Monster Scaling Engine** — Piecewise generator + ratio blueprints
- [x] D2-style XP calc with 3-tier penalty + rarity multipliers
- [x] Formulas engine refactor (formulas.ts) — central source of truth
- [x] scalingTable.ts — generator-based, anchors 1/36/67/110 exact
- [ ] Prestige Layer 1 UI

## Future Milestones

- [ ] Skill Tree integration
- [ ] Act 2-5 zones and bosses
- [ ] Uber/Pandemonium event system
- [ ] Socketing + Gem system
- [ ] Rune Word system

## Next Step
Build the **Item Affix Generator** — prefix/suffix pools, magic/rare affix combinations, quality-dependent affix counts.
