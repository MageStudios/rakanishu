// src/data/treasureClasses.ts
// Diablo 2-style Treasure Classes: TC 3 to TC 87 Ingestion.
// Base item pools sourced from Arreat Summit data.

export interface TCItem {
  id: string;
  name: string;
  weight: number;
  quality: 'normal' | 'magic' | 'rare' | 'unique';
  defense?: number;
  damage?: { min: number; max: number };
  type: 'weapon' | 'armor' | 'shield' | 'helm';
  areaLevelReq: number;
}

export interface TreasureClass {
  name: string;
  tcLevel: number;
  noDropChance: number; // base ProbNoDrop (e.g. 0.625)
  runeChance: number;
  uniqueChance: number;
  items: TCItem[];
  runeMaxTier: number;
}

// ── Item Pool Definitions (TC 3 to TC 87) ───────────────────────────────────

const TC3: TreasureClass = {
  name: 'TC3', tcLevel: 3, noDropChance: 0.625, runeChance: 0.04, uniqueChance: 0.01, runeMaxTier: 3,
  items: [
    { id: 'short_sword', name: 'Short Sword', weight: 3, quality: 'normal', damage: { min: 4, max: 6 }, type: 'weapon', areaLevelReq: 1 },
    { id: 'club', name: 'Club', weight: 4, quality: 'normal', damage: { min: 3, max: 7 }, type: 'weapon', areaLevelReq: 1 },
    { id: 'cap', name: 'Cap', weight: 3, quality: 'normal', defense: 2, type: 'helm', areaLevelReq: 1 },
    { id: 'buckler', name: 'Buckler', weight: 5, quality: 'normal', defense: 5, type: 'shield', areaLevelReq: 1 },
  ],
};

const TC6: TreasureClass = {
  name: 'TC6', tcLevel: 6, noDropChance: 0.625, runeChance: 0.05, uniqueChance: 0.01, runeMaxTier: 6,
  items: [
    { id: 'scimitar', name: 'Scimitar', weight: 3, quality: 'normal', damage: { min: 4, max: 9 }, type: 'weapon', areaLevelReq: 4 },
    { id: 'large_axe', name: 'Large Axe', weight: 4, quality: 'normal', damage: { min: 6, max: 13 }, type: 'weapon', areaLevelReq: 4 },
    { id: 'hunters_bow', name: "Hunter's Bow", weight: 3, quality: 'normal', damage: { min: 4, max: 8 }, type: 'weapon', areaLevelReq: 4 },
    { id: 'quilted_armor', name: 'Quilted Armor', weight: 5, quality: 'normal', defense: 9, type: 'armor', areaLevelReq: 5 },
  ],
};

const TC9: TreasureClass = {
  name: 'TC9', tcLevel: 9, noDropChance: 0.625, runeChance: 0.06, uniqueChance: 0.012, runeMaxTier: 9,
  items: [
    { id: 'dirk', name: 'Dirk', weight: 3, quality: 'normal', damage: { min: 5, max: 12 }, type: 'weapon', areaLevelReq: 7 },
    { id: 'axe', name: 'Axe', weight: 4, quality: 'normal', damage: { min: 6, max: 11 }, type: 'weapon', areaLevelReq: 7 },
    { id: 'heavy_boots', name: 'Heavy Boots', weight: 3, quality: 'normal', defense: 6, type: 'armor', areaLevelReq: 8 },
    { id: 'light_belt', name: 'Light Belt', weight: 3, quality: 'normal', defense: 3, type: 'armor', areaLevelReq: 8 },
  ],
};

const TC12: TreasureClass = {
  name: 'TC12', tcLevel: 12, noDropChance: 0.625, runeChance: 0.07, uniqueChance: 0.015, runeMaxTier: 12,
  items: [
    { id: 'broad_axe', name: 'Broad Axe', weight: 3, quality: 'normal', damage: { min: 10, max: 18 }, type: 'weapon', areaLevelReq: 10 },
    { id: 'kris', name: 'Kris', weight: 4, quality: 'normal', damage: { min: 5, max: 14 }, type: 'weapon', areaLevelReq: 10 },
    { id: 'chain_gloves', name: 'Chain Gloves', weight: 3, quality: 'normal', defense: 9, type: 'armor', areaLevelReq: 11 },
    { id: 'chain_boots', name: 'Chain Boots', weight: 3, quality: 'normal', defense: 11, type: 'armor', areaLevelReq: 11 },
  ],
};

const TC15: TreasureClass = {
  name: 'TC15', tcLevel: 15, noDropChance: 0.625, runeChance: 0.08, uniqueChance: 0.015, runeMaxTier: 15,
  items: [
    { id: 'broad_sword', name: 'Broad Sword', weight: 4, quality: 'normal', damage: { min: 8, max: 20 }, type: 'weapon', areaLevelReq: 13 },
    { id: 'double_axe', name: 'Double Axe', weight: 4, quality: 'normal', damage: { min: 7, max: 18 }, type: 'weapon', areaLevelReq: 13 },
    { id: 'chain_mail', name: 'Chain Mail', weight: 5, quality: 'normal', defense: 16, type: 'armor', areaLevelReq: 14 },
    { id: 'tower_shield', name: 'Tower Shield', weight: 4, quality: 'normal', defense: 22, type: 'shield', areaLevelReq: 14 },
  ],
};

const TC18: TreasureClass = {
  name: 'TC18', tcLevel: 18, noDropChance: 0.625, runeChance: 0.09, uniqueChance: 0.018, runeMaxTier: 18,
  items: [
    { id: 'battle_axe', name: 'Battle Axe', weight: 3, quality: 'normal', damage: { min: 12, max: 32 }, type: 'weapon', areaLevelReq: 16 },
    { id: 'bone_wand', name: 'Bone Wand', weight: 3, quality: 'normal', damage: { min: 3, max: 7 }, type: 'weapon', areaLevelReq: 16 },
    { id: 'splint_mail', name: 'Splint Mail', weight: 5, quality: 'normal', defense: 35, type: 'armor', areaLevelReq: 17 },
    { id: 'mask', name: 'Mask', weight: 3, quality: 'normal', defense: 12, type: 'helm', areaLevelReq: 17 },
  ],
};

const TC21: TreasureClass = {
  name: 'TC21', tcLevel: 21, noDropChance: 0.625, runeChance: 0.10, uniqueChance: 0.02, runeMaxTier: 21,
  items: [
    { id: 'war_scepter', name: 'War Scepter', weight: 3, quality: 'normal', damage: { min: 10, max: 25 }, type: 'weapon', areaLevelReq: 19 },
    { id: 'maul', name: 'Maul', weight: 5, quality: 'normal', damage: { min: 30, max: 45 }, type: 'weapon', areaLevelReq: 19 },
    { id: 'plate_mail', name: 'Plate Mail', weight: 6, quality: 'normal', defense: 45, type: 'armor', areaLevelReq: 20 },
    { id: 'bone_shield', name: 'Bone Shield', weight: 4, quality: 'normal', defense: 25, type: 'shield', areaLevelReq: 20 },
  ],
};

const TC24: TreasureClass = {
  name: 'TC24', tcLevel: 24, noDropChance: 0.625, runeChance: 0.11, uniqueChance: 0.02, runeMaxTier: 24,
  items: [
    { id: 'bastard_sword', name: 'Bastard Sword', weight: 4, quality: 'normal', damage: { min: 20, max: 40 }, type: 'weapon', areaLevelReq: 22 },
    { id: 'pike', name: 'Pike', weight: 5, quality: 'normal', damage: { min: 14, max: 63 }, type: 'weapon', areaLevelReq: 22 },
    { id: 'great_helm', name: 'Great Helm', weight: 3, quality: 'normal', defense: 35, type: 'helm', areaLevelReq: 23 },
    { id: 'field_plate', name: 'Field Plate', weight: 6, quality: 'normal', defense: 105, type: 'armor', areaLevelReq: 23 },
  ],
};

const TC27: TreasureClass = {
  name: 'TC27', tcLevel: 27, noDropChance: 0.625, runeChance: 0.12, uniqueChance: 0.02, runeMaxTier: 27,
  items: [
    { id: 'flamberge', name: 'Flamberge', weight: 4, quality: 'normal', damage: { min: 9, max: 25 }, type: 'weapon', areaLevelReq: 25 },
    { id: 'giant_axe', name: 'Giant Axe', weight: 5, quality: 'normal', damage: { min: 22, max: 45 }, type: 'weapon', areaLevelReq: 25 },
    { id: 'greaves', name: 'Greaves', weight: 3, quality: 'normal', defense: 25, type: 'armor', areaLevelReq: 26 },
    { id: 'gothic_plate', name: 'Gothic Plate', weight: 6, quality: 'normal', defense: 128, type: 'armor', areaLevelReq: 26 },
  ],
};

const TC30: TreasureClass = {
  name: 'TC30', tcLevel: 30, noDropChance: 0.625, runeChance: 0.13, uniqueChance: 0.025, runeMaxTier: 30,
  items: [
    { id: 'gladius', name: 'Gladius', weight: 4, quality: 'normal', damage: { min: 28, max: 45 }, type: 'weapon', areaLevelReq: 28 },
    { id: 'crown', name: 'Crown', weight: 3, quality: 'normal', defense: 45, type: 'helm', areaLevelReq: 29 },
    { id: 'full_plate_mail', name: 'Full Plate Mail', weight: 7, quality: 'normal', defense: 155, type: 'armor', areaLevelReq: 29 },
  ],
};

const TC33: TreasureClass = {
  name: 'TC33', tcLevel: 33, noDropChance: 0.625, runeChance: 0.14, uniqueChance: 0.025, runeMaxTier: 33,
  items: [
    { id: 'tulwar', name: 'Tulwar', weight: 4, quality: 'normal', damage: { min: 32, max: 55 }, type: 'weapon', areaLevelReq: 31 },
    { id: 'lochaber_axe', name: 'Lochaber Axe', weight: 5, quality: 'normal', damage: { min: 10, max: 65 }, type: 'weapon', areaLevelReq: 31 },
    { id: 'war_dart', name: 'War Dart', weight: 3, quality: 'normal', damage: { min: 11, max: 24 }, type: 'weapon', areaLevelReq: 32 },
  ],
};

const TC36: TreasureClass = {
  name: 'TC36', tcLevel: 36, noDropChance: 0.625, runeChance: 0.15, uniqueChance: 0.03, runeMaxTier: 33,
  items: [
    { id: 'arbalest', name: 'Arbalest', weight: 4, quality: 'normal', damage: { min: 14, max: 27 }, type: 'weapon', areaLevelReq: 34 },
    { id: 'cedar_bow', name: 'Cedar Bow', weight: 4, quality: 'normal', damage: { min: 10, max: 29 }, type: 'weapon', areaLevelReq: 34 },
    { id: 'alpha_helm', name: 'Alpha Helm', weight: 3, quality: 'normal', defense: 55, type: 'helm', areaLevelReq: 35 },
  ],
};

const TC39: TreasureClass = {
  name: 'TC39', tcLevel: 39, noDropChance: 0.625, runeChance: 0.16, uniqueChance: 0.03, runeMaxTier: 33,
  items: [
    { id: 'cutlass', name: 'Cutlass', weight: 4, quality: 'normal', damage: { min: 35, max: 65 }, type: 'weapon', areaLevelReq: 37 },
    { id: 'crowbill', name: 'Crowbill', weight: 4, quality: 'normal', damage: { min: 14, max: 34 }, type: 'weapon', areaLevelReq: 37 },
    { id: 'divine_scepter', name: 'Divine Scepter', weight: 3, quality: 'normal', damage: { min: 15, max: 35 }, type: 'weapon', areaLevelReq: 38 },
  ],
};

const TC42: TreasureClass = {
  name: 'TC42', tcLevel: 42, noDropChance: 0.625, runeChance: 0.17, uniqueChance: 0.03, runeMaxTier: 33,
  items: [
    { id: 'ancient_armor', name: 'Ancient Armor', weight: 6, quality: 'normal', defense: 210, type: 'armor', areaLevelReq: 40 },
    { id: 'battle_sword', name: 'Battle Sword', weight: 4, quality: 'normal', damage: { min: 16, max: 34 }, type: 'weapon', areaLevelReq: 40 },
    { id: 'barbed_shield', name: 'Barbed Shield', weight: 4, quality: 'normal', defense: 68, type: 'shield', areaLevelReq: 41 },
  ],
};

const TC45: TreasureClass = {
  name: 'TC45', tcLevel: 45, noDropChance: 0.625, runeChance: 0.18, uniqueChance: 0.035, runeMaxTier: 33,
  items: [
    { id: 'basinet', name: 'Basinet', weight: 3, quality: 'normal', defense: 85, type: 'helm', areaLevelReq: 43 },
    { id: 'dragon_shield', name: 'Dragon Shield', weight: 4, quality: 'normal', defense: 75, type: 'shield', areaLevelReq: 43 },
    { id: 'knout', name: 'Knout', weight: 4, quality: 'normal', damage: { min: 13, max: 35 }, type: 'weapon', areaLevelReq: 44 },
  ],
};

const TC48: TreasureClass = {
  name: 'TC48', tcLevel: 48, noDropChance: 0.625, runeChance: 0.19, uniqueChance: 0.035, runeMaxTier: 33,
  items: [
    { id: 'ballista', name: 'Ballista', weight: 4, quality: 'normal', damage: { min: 33, max: 83 }, type: 'weapon', areaLevelReq: 46 },
    { id: 'battle_hammer', name: 'Battle Hammer', weight: 4, quality: 'normal', damage: { min: 35, max: 58 }, type: 'weapon', areaLevelReq: 46 },
    { id: 'cuirass', name: 'Cuirass', weight: 5, quality: 'normal', defense: 200, type: 'armor', areaLevelReq: 47 },
  ],
};

const TC51: TreasureClass = {
  name: 'TC51', tcLevel: 51, noDropChance: 0.625, runeChance: 0.20, uniqueChance: 0.035, runeMaxTier: 33,
  items: [
    { id: 'ancient_axe', name: 'Ancient Axe', weight: 4, quality: 'normal', damage: { min: 43, max: 85 }, type: 'weapon', areaLevelReq: 49 },
    { id: 'ancient_sword', name: 'Ancient Sword', weight: 4, quality: 'normal', damage: { min: 18, max: 43 }, type: 'weapon', areaLevelReq: 49 },
    { id: 'battle_boots', name: 'Battle Boots', weight: 3, quality: 'normal', defense: 45, type: 'armor', areaLevelReq: 50 },
  ],
};

const TC54: TreasureClass = {
  name: 'TC54', tcLevel: 54, noDropChance: 0.625, runeChance: 0.21, uniqueChance: 0.04, runeMaxTier: 33,
  items: [
    { id: 'executioner_sword', name: 'Executioner Sword', weight: 4, quality: 'normal', damage: { min: 47, max: 80 }, type: 'weapon', areaLevelReq: 52 },
    { id: 'gothic_bow', name: 'Gothic Bow', weight: 4, quality: 'normal', damage: { min: 10, max: 50 }, type: 'weapon', areaLevelReq: 52 },
    { id: 'coronet', name: 'Coronet', weight: 3, quality: 'normal', defense: 40, type: 'helm', areaLevelReq: 53 },
  ],
};

const TC57: TreasureClass = {
  name: 'TC57', tcLevel: 57, noDropChance: 0.625, runeChance: 0.22, uniqueChance: 0.04, runeMaxTier: 33,
  items: [
    { id: 'falcata', name: 'Falcata', weight: 4, quality: 'normal', damage: { min: 31, max: 77 }, type: 'weapon', areaLevelReq: 55 },
    { id: 'feral_axe', name: 'Feral Axe', weight: 4, quality: 'normal', damage: { min: 25, max: 123 }, type: 'weapon', areaLevelReq: 55 },
    { id: 'ancient_shield', name: 'Ancient Shield', weight: 4, quality: 'normal', defense: 95, type: 'shield', areaLevelReq: 56 },
  ],
};

const TC60: TreasureClass = {
  name: 'TC60', tcLevel: 60, noDropChance: 0.625, runeChance: 0.23, uniqueChance: 0.04, runeMaxTier: 33,
  items: [
    { id: 'bone_knife', name: 'Bone Knife', weight: 4, quality: 'normal', damage: { min: 23, max: 49 }, type: 'weapon', areaLevelReq: 58 },
    { id: 'blade_bow', name: 'Blade Bow', weight: 4, quality: 'normal', damage: { min: 21, max: 41 }, type: 'weapon', areaLevelReq: 58 },
    { id: 'embossed_plate', name: 'Embossed Plate', weight: 6, quality: 'normal', defense: 300, type: 'armor', areaLevelReq: 59 },
  ],
};

const TC63: TreasureClass = {
  name: 'TC63', tcLevel: 63, noDropChance: 0.625, runeChance: 0.24, uniqueChance: 0.045, runeMaxTier: 33,
  items: [
    { id: 'elegant_blade', name: 'Elegant Blade', weight: 4, quality: 'normal', damage: { min: 35, max: 55 }, type: 'weapon', areaLevelReq: 61 },
    { id: 'boneweave', name: 'Boneweave', weight: 6, quality: 'normal', defense: 450, type: 'armor', areaLevelReq: 61 },
    { id: 'ataghan', name: 'Ataghan', weight: 4, quality: 'normal', damage: { min: 35, max: 62 }, type: 'weapon', areaLevelReq: 62 },
  ],
};

const TC66: TreasureClass = {
  name: 'TC66', tcLevel: 66, noDropChance: 0.625, runeChance: 0.25, uniqueChance: 0.045, runeMaxTier: 33,
  items: [
    { id: 'colossus_voulge', name: 'Colossus Voulge', weight: 4, quality: 'normal', damage: { min: 17, max: 165 }, type: 'weapon', areaLevelReq: 64 },
    { id: 'dusk_shroud', name: 'Dusk Shroud', weight: 6, quality: 'normal', defense: 467, type: 'armor', areaLevelReq: 64 },
    { id: 'ghost_wand', name: 'Ghost Wand', weight: 3, quality: 'normal', damage: { min: 20, max: 40 }, type: 'weapon', areaLevelReq: 65 },
  ],
};

const TC69: TreasureClass = {
  name: 'TC69', tcLevel: 69, noDropChance: 0.625, runeChance: 0.26, uniqueChance: 0.045, runeMaxTier: 33,
  items: [
    { id: 'great_bow', name: 'Great Bow', weight: 4, quality: 'normal', damage: { min: 12, max: 52 }, type: 'weapon', areaLevelReq: 67 },
    { id: 'armet', name: 'Armet', weight: 3, quality: 'normal', defense: 145, type: 'helm', areaLevelReq: 68 },
    { id: 'blade_barrier', name: 'Blade Barrier', weight: 4, quality: 'normal', defense: 165, type: 'shield', areaLevelReq: 68 },
  ],
};

const TC72: TreasureClass = {
  name: 'TC72', tcLevel: 72, noDropChance: 0.625, runeChance: 0.27, uniqueChance: 0.05, runeMaxTier: 33,
  items: [
    { id: 'balrog_blade', name: 'Balrog Blade', weight: 4, quality: 'normal', damage: { min: 15, max: 75 }, type: 'weapon', areaLevelReq: 70 },
    { id: 'diamond_bow', name: 'Diamond Bow', weight: 4, quality: 'normal', damage: { min: 33, max: 40 }, type: 'weapon', areaLevelReq: 70 },
    { id: 'boneweave_boots', name: 'Boneweave Boots', weight: 3, quality: 'normal', defense: 68, type: 'armor', areaLevelReq: 71 },
  ],
};

const TC75: TreasureClass = {
  name: 'TC75', tcLevel: 75, noDropChance: 0.625, runeChance: 0.28, uniqueChance: 0.05, runeMaxTier: 33,
  items: [
    { id: 'decapitator', name: 'Decapitator', weight: 4, quality: 'normal', damage: { min: 49, max: 137 }, type: 'weapon', areaLevelReq: 73 },
    { id: 'demonhead', name: 'Demonhead', weight: 3, quality: 'normal', defense: 155, type: 'helm', areaLevelReq: 74 },
    { id: 'colossus_crossbow', name: 'Colossus Crossbow', weight: 4, quality: 'normal', damage: { min: 32, max: 91 }, type: 'weapon', areaLevelReq: 74 },
  ],
};

const TC78: TreasureClass = {
  name: 'TC78', tcLevel: 78, noDropChance: 0.625, runeChance: 0.29, uniqueChance: 0.05, runeMaxTier: 33,
  items: [
    { id: 'champion_sword', name: 'Champion Sword', weight: 4, quality: 'normal', damage: { min: 24, max: 54 }, type: 'weapon', areaLevelReq: 76 },
    { id: 'crusader_bow', name: 'Crusader Bow', weight: 4, quality: 'normal', damage: { min: 15, max: 63 }, type: 'weapon', areaLevelReq: 76 },
    { id: 'scourge', name: 'Scourge', weight: 4, quality: 'normal', damage: { min: 3, max: 80 }, type: 'weapon', areaLevelReq: 77 },
  ],
};

const TC81: TreasureClass = {
  name: 'TC81', tcLevel: 81, noDropChance: 0.625, runeChance: 0.30, uniqueChance: 0.055, runeMaxTier: 33,
  items: [
    { id: 'colossus_sword', name: 'Colossus Sword', weight: 4, quality: 'normal', damage: { min: 26, max: 70 }, type: 'weapon', areaLevelReq: 79 },
    { id: 'kraken_shell', name: 'Kraken Shell', weight: 6, quality: 'normal', defense: 517, type: 'armor', areaLevelReq: 79 },
    { id: 'runic_talons', name: 'Runic Talons', weight: 3, quality: 'normal', damage: { min: 24, max: 44 }, type: 'weapon', areaLevelReq: 80 },
  ],
};

const TC84: TreasureClass = {
  name: 'TC84', tcLevel: 84, noDropChance: 0.625, runeChance: 0.31, uniqueChance: 0.055, runeMaxTier: 33,
  items: [
    { id: 'archon_plate', name: 'Archon Plate', weight: 6, quality: 'normal', defense: 524, type: 'armor', areaLevelReq: 82 },
    { id: 'bone_visage', name: 'Bone Visage', weight: 3, quality: 'normal', defense: 157, type: 'helm', areaLevelReq: 82 },
    { id: 'champion_axe', name: 'Champion Axe', weight: 4, quality: 'normal', damage: { min: 59, max: 94 }, type: 'weapon', areaLevelReq: 83 },
  ],
};

const TC87: TreasureClass = {
  name: 'TC87', tcLevel: 87, noDropChance: 0.625, runeChance: 0.32, uniqueChance: 0.06, runeMaxTier: 33,
  items: [
    { id: 'berserker_axe', name: 'Berserker Axe', weight: 4, quality: 'normal', damage: { min: 24, max: 71 }, type: 'weapon', areaLevelReq: 85 },
    { id: 'colossus_blade', name: 'Colossus Blade', weight: 4, quality: 'normal', damage: { min: 25, max: 75 }, type: 'weapon', areaLevelReq: 85 },
    { id: 'sacred_armor', name: 'Sacred Armor', weight: 6, quality: 'normal', defense: 600, type: 'armor', areaLevelReq: 86 },
    { id: 'hydra_bow', name: 'Hydra Bow', weight: 4, quality: 'normal', damage: { min: 10, max: 68 }, type: 'weapon', areaLevelReq: 87 },
  ],
};

const TREASURE_CLASSES: Record<number, TreasureClass> = {
  3: TC3, 6: TC6, 9: TC9, 12: TC12, 15: TC15, 18: TC18, 21: TC21, 24: TC24, 27: TC27, 30: TC30,
  33: TC33, 36: TC36, 39: TC39, 42: TC42, 45: TC45, 48: TC48, 51: TC51, 54: TC54, 57: TC57, 60: TC60,
  63: TC63, 66: TC66, 69: TC69, 72: TC72, 75: TC75, 78: TC78, 81: TC81, 84: TC84, 87: TC87,
};

export const RUNE_NAMES = [
  'El','Eld','Tir','Nef','Eth','Ith','Tal','Ral','Ort','Thul',
  'Amn','Sol','Shael','Dol','Hel','Io','Lum','Ko','Fal','Lem',
  'Pul','Um','Mal','Ist','Gul','Vex','Ohm','Lo','Sur','Ber',
  'Jah','Cham','Zod',
];

export function getTC(tcLevel: number): TreasureClass | null {
  return TREASURE_CLASSES[tcLevel] ?? null;
}

/** 
 * Roll a single item from a TC pool. 
 * Implements exponential NoDrop scaling based on partySize.
 */
export function rollTCItem(tcLevel: number, partySize: number = 1): { item: TCItem; quality: 'normal'|'magic'|'rare'|'unique'; rune?: string } | null {
  const tc = TREASURE_CLASSES[tcLevel];
  if (!tc) return null;

  // New NoDrop Law: Floor(ProbNoDrop^((Players + BonusPlayers)/1))
  // Using partySize as the exponent proxy.
  const scaledNoDropChance = Math.pow(tc.noDropChance, partySize);
  
  if (rngFloat() < scaledNoDropChance) return null;

  // Rune check (override item)
  if (rngFloat() < tc.runeChance) {
    const maxTier = Math.min(33, tc.runeMaxTier);
    return { item: tc.items[0], quality: 'normal', rune: RUNE_NAMES[Math.floor(rngFloat() * maxTier)] };
  }

  // Weighted item selection
  const totalW = tc.items.reduce((s, i) => s + i.weight, 0);
  let roll = rngFloat() * totalW;
  let picked: TCItem = tc.items[0];
  for (const it of tc.items) {
    roll -= it.weight;
    if (roll <= 0) { picked = it; break; }
  }

  // Quality override → unique
  let quality: 'normal'|'magic'|'rare'|'unique' = picked.quality;
  if (picked.quality === 'normal' && rngFloat() < tc.uniqueChance) {
    quality = 'unique';
  }

  return { item: picked, quality };
}

// ── Embedded Xoshiro256++ PRNG (same architecture as combat) ──
let _s0 = 1, _s1 = 2, _s2 = 3, _s3 = 4;
function rngFloat(): number {
  const s3 = _s3;
  const result = (_s0 + _s3) >>> 0;
  const t = (_s1 << 17) >>> 0;
  _s2 ^= _s0; _s3 ^= _s1; _s1 ^= _s2; _s0 ^= _s3;
  _s2 ^= t;  _s3 = (_s3 << 7) >>> 0;
  _s3 ^= _s2; _s3 = (_s3 << 45) >>> 0;
  return (result / 4294967296);
}
