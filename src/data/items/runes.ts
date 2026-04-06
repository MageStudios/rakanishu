export interface Rune {
  name: string;
  tier: number;
  weaponMod: string;
  armorMod: string;
  runewordHint?: string;
}

export const runes: Rune[] = [
  { name: "El", tier: 1, weaponMod: "+50 to Attack Rating", armorMod: "+15 to Defense" },
  { name: "Eld", tier: 2, weaponMod: "+75 to Attack Rating vs Undead", armorMod: "+15% Slower Stamina Drain" },
  { name: "Tir", tier: 3, weaponMod: "+2 to Mana after each Kill", armorMod: "+2 to Mana after each Kill" },
  { name: "Nef", tier: 4, weaponMod: "+10 to Knockback", armorMod: "+30 to Defense vs Missile" },
  { name: "Eth", tier: 5, weaponMod: "-25% to Target Defense", armorMod: "+15 to Max Mana" },
  { name: "Ith", tier: 6, weaponMod: "+9 to Max Damage", armorMod: "+15 to Damage Taken Goes To Mana" },
  { name: "Tal", tier: 7, weaponMod: "+75 Poison Damage over 5s", armorMod: "+30% Resist Poison" },
  { name: "Ral", tier: 8, weaponMod: "+5-30 Fire Damage", armorMod: "+30% Resist Fire" },
  { name: "Ort", tier: 9, weaponMod: "+1-50 Lightning Damage", armorMod: "+30% Resist Lightning" },
  { name: "Thul", tier: 10, weaponMod: "+3-14 Cold Damage", armorMod: "+30% Resist Cold" },
  { name: "Amn", tier: 11, weaponMod: "7% Life Steal", armorMod: "Attacker Takes 14 Damage" },
  { name: "Sol", tier: 12, weaponMod: "+9 to Minimum Damage", armorMod: "Damage Reduced by 7" },
  { name: "Shael", tier: 13, weaponMod: "+20% Increased Attack Speed", armorMod: "+20% Faster Hit Recovery" },
  { name: "Dol", tier: 14, weaponMod: "+75% Chance of Open Wounds", armorMod: "Replenish Life +7" },
  { name: "Hel", tier: 15, weaponMod: "-20% to Requirements", armorMod: "-15% to Requirements" },
  { name: "Io", tier: 16, weaponMod: "+10 to Vitality", armorMod: "+10 to Vitality", runewordHint: "Spirit, Insight" },
  { name: "Lum", tier: 17, weaponMod: "+10 to Energy", armorMod: "+10 to Energy" },
  { name: "Ko", tier: 18, weaponMod: "+10 to Dexterity", armorMod: "+10 to Dexterity" },
  { name: "Fal", tier: 19, weaponMod: "+10 to Strength", armorMod: "+10 to Strength" },
  { name: "Lem", tier: 20, weaponMod: "+75% Extra Gold from Monsters", armorMod: "+50% Magic Find" },
  { name: "Pul", tier: 21, weaponMod: "+30% Increased Attack Speed / +20% Skill", armorMod: "+30% Resist All", runewordHint: "Spirit, Insight" },
  { name: "Um", tier: 22, weaponMod: "25% Chance of Crushing Blow", armorMod: "Half Freeze Duration" },
  { name: "Mal", tier: 23, weaponMod: "Prevent Monster Heal", armorMod: "Magic Damage Reduced by 7", runewordHint: "Enigma" },
  { name: "Ist", tier: 24, weaponMod: "+30% Magic Find", armorMod: "+25% Magic Find" },
  { name: "Gul", tier: 25, weaponMod: "+20% to Attack Rating", armorMod: "+5% to Max Poison Resist" },
  { name: "Vex", tier: 26, weaponMod: "+7% Life Steal / +7% Mana Steal", armorMod: "+5% to Max Fire Resist" },
  { name: "Ohm", tier: 27, weaponMod: "+50% Enhanced Damage", armorMod: "+5% to Max Cold Resist" },
  { name: "Lo", tier: 28, weaponMod: "+20% Chance of Deadly Strike", armorMod: "+5% to Max Lightning Resist" },
  { name: "Sur", tier: 29, weaponMod: "+2 to All Skills", armorMod: "+50 to Life" },
  { name: "Ber", tier: 30, weaponMod: "+20% Chance of Crushing Blow", armorMod: "Damage Reduced by 5%", runewordHint: "Enigma, Last Wish" },
  { name: "Jah", tier: 31, weaponMod: "+20% Chance to Monster Die When Hit", armorMod: "+50 to Life" },
  { name: "Cham", tier: 32, weaponMod: "Freeze Target +3s", armorMod: "Cannot Be Frozen" },
  { name: "Zod", tier: 33, weaponMod: "Indestructible", armorMod: "Indestructible" },
];
