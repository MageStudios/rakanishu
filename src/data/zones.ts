// src/data/zones.ts — Authentic Diablo 2 Act 1 Area Mapping
// 100% Completionist Clear Path (lore-accurate bosses + mandatoryClear):
// Blood Moor → Den of Evil (Corpsefire) → Cold Plains (Bishibosh) → The Cave (Coldcrow)
// → Burial Grounds (Blood Raven) → The Crypt (Bonebreaker) → The Mausoleum → Stony Field (Rakanishu)

export interface Zone {
  id: string;
  name: string;
  areaLevel: number;
  zoneType: 'field' | 'dungeon' | 'boss_lair' | 'boss_graveyard' | 'boss_tower' | 'boss_tristram' | 'boss_hell';
  monsters: string[];
  bossName?: string;
  bossDropMultiplier?: number;
  /** This zone must have its boss killed for the 100% completionist path. */
  mandatoryClear?: boolean;
}

// ─── 100% Completionist Clear Path ───
export const act1Zones: Zone[] = [
  // 1 — Blood Moor (no boss — clear all monsters)
  {
    id: "blood_moor",
    name: "Blood Moor",
    areaLevel: 2,
    zoneType: "field",
    monsters: ["Fallen", "Fallen One", "Blood Hawk"],
    mandatoryClear: true,
  },
  // 2 — Den of Evil
  {
    id: "den_of_evil",
    name: "Den of Evil",
    areaLevel: 1,
    zoneType: "boss_lair",
    monsters: ["Fallen", "Fallen Shaman"],
    bossName: "Corpsefire",
    bossDropMultiplier: 1.5,
    mandatoryClear: true,
  },
  // 3 — Cold Plains
  {
    id: "cold_plains",
    name: "Cold Plains",
    areaLevel: 3,
    zoneType: "field",
    monsters: ["Dark Hunter", "Carver", "Dark Stalker"],
    bossName: "Bishibosh",
    bossDropMultiplier: 2.0,
    mandatoryClear: true,
  },
  // 4 — The Cave
  {
    id: "the_cave",
    name: "The Cave",
    areaLevel: 4,
    zoneType: "dungeon",
    monsters: ["Quill Rat", "Slinger", "Brute"],
    bossName: "Coldcrow",
    bossDropMultiplier: 2.0,
    mandatoryClear: true,
  },
  // 5 — Burial Grounds
  {
    id: "burial_grounds",
    name: "Burial Grounds",
    areaLevel: 3,
    zoneType: "boss_graveyard",
    monsters: ["Bone Mage", "Specter", "Wraith"],
    bossName: "Blood Raven",
    bossDropMultiplier: 2.0,
    mandatoryClear: true,
  },
  // 6 — The Crypt
  {
    id: "crypt",
    name: "The Crypt",
    areaLevel: 8,
    zoneType: "dungeon",
    monsters: ["Zombie", "Drowned Carcass", "Dark Shape"],
    bossName: "Bonebreaker",
    bossDropMultiplier: 2.5,
    mandatoryClear: true,
  },
  // 7 — The Mausoleum
  {
    id: "mausoleum",
    name: "The Mausoleum",
    areaLevel: 8,
    zoneType: "dungeon",
    monsters: ["Horror", "Wraith", "Dark Shape"],
    mandatoryClear: true,
  },
  // 8 — Stony Field
  {
    id: "stony_field",
    name: "Stony Field",
    areaLevel: 4,
    zoneType: "field",
    monsters: ["Zombie", "Ghoul", "Brute"],
    bossName: "Rakanishu",
    bossDropMultiplier: 1.5,
    mandatoryClear: true,
  },
  // ─── Remaining Act 1 Zones (Optional / Side Quests) ───
  {
    id: "dark_wood",
    name: "Dark Wood",
    areaLevel: 5,
    zoneType: "field",
    monsters: ["Wraith", "Dark Stalker", "Brute"],
  },
  {
    id: "underground_passage_1",
    name: "Underground Passage Level 1",
    areaLevel: 6,
    zoneType: "dungeon",
    monsters: ["Skeleton", "Dark One"],
  },
  {
    id: "tristram",
    name: "Tristram",
    areaLevel: 6,
    zoneType: "boss_tristram",
    monsters: ["Dark Archer", "Skeleton Archer"],
    bossName: "Griswold (rescued)",
    bossDropMultiplier: 2.5,
  },
  {
    id: "forgotten_tower",
    name: "The Forgotten Tower",
    areaLevel: 6,
    zoneType: "boss_tower",
    monsters: ["Specter", "Ghost"],
    bossName: "The Countess",
    bossDropMultiplier: 3.0,
  },
  {
    id: "black_marsh",
    name: "Black Marsh",
    areaLevel: 6,
    zoneType: "field",
    monsters: ["Bog Creature", "Dark Ranger", "Carver"],
  },
  {
    id: "hole_level_1",
    name: "Hole Level 1",
    areaLevel: 7,
    zoneType: "dungeon",
    monsters: ["Bone Breaker", "Dark Shape"],
  },
  {
    id: "hole_level_2",
    name: "Hole Level 2",
    areaLevel: 9,
    zoneType: "dungeon",
    monsters: ["Brute", "Gloam"],
  },
  {
    id: "underground_passage_2",
    name: "Underground Passage Level 2",
    areaLevel: 7,
    zoneType: "dungeon",
    monsters: ["Giant Beast", "Flesh Spawner"],
  },
  {
    id: "tamoe_highland",
    name: "Tamoe Highland",
    areaLevel: 7,
    zoneType: "field",
    monsters: ["Mauler", "Giant Urn"],
  },
  {
    id: "monastery_gate",
    name: "Monastery Gate",
    areaLevel: 8,
    zoneType: "field",
    monsters: ["Mauler", "Dark Spearman"],
  },
  {
    id: "outer_cloister",
    name: "Outer Cloister",
    areaLevel: 9,
    zoneType: "field",
    monsters: ["Dark Archer", "Ghost"],
  },
  {
    id: "barracks",
    name: "Barracks",
    areaLevel: 10,
    zoneType: "dungeon",
    monsters: ["Skeleton", "Dark Archer"],
  },
  {
    id: "jail_level_1",
    name: "Jail Level 1",
    areaLevel: 11,
    zoneType: "dungeon",
    monsters: ["Dark Guard", "Warden"],
  },
  {
    id: "jail_level_2",
    name: "Jail Level 2",
    areaLevel: 12,
    zoneType: "dungeon",
    monsters: ["Flesh Hunter", "Black Rogue"],
  },
  {
    id: "jail_level_3",
    name: "Jail Level 3",
    areaLevel: 13,
    zoneType: "dungeon",
    monsters: ["Dark Ranger", "Horror"],
  },
  {
    id: "inner_cloister",
    name: "Inner Cloister",
    areaLevel: 14,
    zoneType: "field",
    monsters: ["Dark One", "Blood Knight"],
  },
  {
    id: "cathedral",
    name: "Cathedral",
    areaLevel: 15,
    zoneType: "dungeon",
    monsters: ["Dark Archon", "Horror", "Dark Stalker"],
  },
  {
    id: "catacombs_level_1",
    name: "Catacombs Level 1",
    areaLevel: 13,
    zoneType: "dungeon",
    monsters: ["Dark Stalker", "Blood Slayer"],
  },
  {
    id: "catacombs_level_2",
    name: "Catacombs Level 2",
    areaLevel: 15,
    zoneType: "dungeon",
    monsters: ["Mauler", "Stygian Doll"],
  },
  {
    id: "catacombs_level_3",
    name: "Catacombs Level 3",
    areaLevel: 16,
    zoneType: "dungeon",
    monsters: ["Gloam", "Doom Knight"],
  },
  {
    id: "catacombs_level_4",
    name: "Catacombs Level 4",
    areaLevel: 12,
    zoneType: "boss_hell",
    monsters: ["Pain Witch", "Blood Lord"],
    bossName: "Andariel, Daughter of Anguish",
    bossDropMultiplier: 5.0,
  },
];

// Lookup utilities (O(1) by ID)
const zoneMap = new Map(act1Zones.map(z => [z.id, z]));

export function getZoneById(id: string): Zone | undefined {
  return zoneMap.get(id);
}

export function getZonesByType(type: Zone['zoneType']): Zone[] {
  return act1Zones.filter(z => z.zoneType === type);
}

/**
 * The 100% Completionist Route — mandatory zones in lore-accurate order.
 *
 * Blood Moor → Den of Evil (Corpsefire) → Cold Plains (Bishibosh) → The Cave (Coldcrow)
 * → Burial Grounds (Blood Raven) → The Crypt (Bonebreaker) → The Mausoleum
 * → Stony Field (Rakanishu)
 */
export const CLEAR_PATH_ZONES: readonly string[] = [
  'blood_moor',
  'den_of_evil',
  'cold_plains',
  'the_cave',
  'burial_grounds',
  'crypt',
  'mausoleum',
  'stony_field',
];

export function isMandatoryZone(zoneId: string): boolean {
  return (CLEAR_PATH_ZONES as readonly string[]).includes(zoneId);
}

export function getMandatoryPath(): Zone[] {
  return CLEAR_PATH_ZONES
    .map(id => getZoneById(id))
    .filter((z): z is Zone => z !== undefined);
}

export function getRemainingMandatoryZones(clearedIds: Set<string>): Zone[] {
  return getMandatoryPath().filter(z => !clearedIds.has(z.id));
}
