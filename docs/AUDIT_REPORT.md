# UI Audit Report — Gothic Spec Compliance

**Date**: 2026-04-06
**Audited Files**: `src/index.css`, `src/App.tsx`
**Reference**: `GOTHIC-UI-SPEC.md`

---

## Summary

| File | Violations |
|------|------------|
| `src/index.css` | **6** |
| `src/App.tsx` | **0** |

---

## `src/index.css` — Violations

### 1. `--color-setGreen: #00FF00`  🔴 CRITICAL
- **Line 15** — Pure neon green (`#00FF00`) is completely antithetical to the gothic palette.
- **Spec**: No entry exists for green; the approved core palette is Obsidian, Panels, Blood-Red, and Bone.
- **Recommended**: Replace with a desaturated, gothic green such as `#2d4a2d` or `#3a5a3a`.

### 2. `--color-magicBlue: #4B69FF`  ⚠️
- **Line 16** — Saturated royal blue not in the approved palette.
- **Spec**: Only `#0a0a0a`, `#1a1a1a`, `#8a0000`, `#e2dac2` are defined.
- **Recommended**: If rarity blue is needed, use a muted variant like `#4a5a8a` to preserve the gothic aesthetic.

### 3. `--color-runeOrange: #D4A43C` / `--color-superiorGold: #D4A43C` / `--color-rareYellow: #D4A43C` / `--color-craftedOrange: #D4A43C`  ⚠️
- **Lines 9, 12, 14, 15** — `#D4A43C` is used across 4 rarity color variables. Not in the approved core palette.
- **Spec**: Only 4 colors defined; no gold/orange/yellow entries.
- **Recommended**: If gold accents are needed, consider using `--color-gold: #908858` (already defined on line 5) or a unified gothic gold like `#8a7a4a`.

### 4. `--color-uniqueGreen: #908858`  ℹ️
- **Line 13** — Labeled as "uniqueGreen" but contains `#908858`, the same value as `--color-gold`. Misnamed and not in core palette.
- **Recommended**: Rename to `uniqueGold` or assign a distinct value.

### 5. `--color-grayLow: #696969` / `--color-normalGray: #696969`  ℹ️ CONTEXTUAL
- **Lines 16-17** — `#696969` (dimgray) is **not** in GOTHIC-UI-SPEC.md palette.
- **Caveat**: The Mage Studios Law (Project Hints) explicitly requires `[LOW] items MUST render as Gray (#696969)`. This is a cross-spec requirement — acceptable per charter but not per the UI spec alone.

### 6. `--color-gold: #908858`  ℹ️ CONTEXTUAL
- **Line 5** — Gold is not in the GOTHIC-UI-SPEC.md core palette of 4 colors.
- **Caveat**: Gold is used for rarity tiers in the game. If the spec is meant to be the *complete* palette, this is a deviation.

---

## `src/App.tsx` — No Violations

All checks pass:

| Check | Found | Spec Requirement | Status |
|-------|-------|------------------|--------|
| Background color | `#0a0a0a` | Obsidian `#0a0a0a` | ✅ |
| Text color | `#e2dac2` | Bone `#e2dac2` | ✅ |
| Border color | `#8a0000` | Blood-Red `#8a0000` | ✅ |
| Layout ratios | `w-1/4`, `w-1/2`, `w-1/4` | 25% / 50% / 25% | ✅ |
| Width strings | Fraction classes only | No `%` strings | ✅ |
| Tailwind grays | None used | Forbidden | ✅ |
| `text-white` | Not used | Forbidden | ✅ |

---

## Recommendations

1. **CRITICAL**: Replace `#00FF00` (neon green) — single worst violation of gothic identity.
2. **HIGH**: Audit all rarity color values (`#4B69FF`, `#D4A43C`) and desaturate to match gothic tone.
3. **LOW**: Rename `--color-uniqueGreen` — currently holds a gold value, not green.
4. **CONSIDER**: If the core palette in GOTHIC-UI-SPEC.md is meant to be exclusive, formalize rarity colors as approved extensions by adding them to the spec.
