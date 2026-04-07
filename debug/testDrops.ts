/* debug: testDrops.ts — LootTest Verification */
import { ACT1_BASES } from '../src/data/items/bases';
import { rollAffixes, calcLevelReq } from '../src/logic/itemGenerator';

const MASK = (1n << 64n) - 1n;
const _rotl = (x: bigint, k: bigint): bigint => ((x << k) | (x >> (64n - k))) & MASK;

function _step256pp(s: BigUint64Array): bigint {
  const result = (_rotl(s[0] + s[3], 17n) + s[0]) & MASK;
  const t = (s[1] << 17n) & MASK;
  s[2] ^= s[0]; s[3] ^= s[1]; s[1] ^= s[2]; s[0] ^= s[3]; s[2] ^= t;
  s[3] = _rotl(s[3], 45n);
  return result;
}

// Seeded PRNG — deterministic
const state = new BigUint64Array([0xDEAD_BEEFn, 0xCAFE_BABEn, 0x1234_5678n, 0x9ABC_DEF0n]);

console.log('═══ RAKANISHU LOOTTEST ═══\n');
console.log('Seed: 0xDEADBEEF / 0xCAFE_BABE / 0x12345678 / 0x9ABCDEF0\n');

// 5 White (Normal)
for (const base of ACT1_BASES.slice(0, 5)) {
  console.log(`[White] ${base.name}  |  Level: ${base.requirements.level}`);
}

console.log('\n');

// 10 Blue (Magic)
const magicLevels = [1, 3, 6, 10, 15, 12, 18, 25, 35, 50];
for (const ml of magicLevels) {
  const base = ACT1_BASES[Number(_step256pp(state) % BigInt(ACT1_BASES.length))];
  const { name, prefix, suffix } = rollAffixes(base, ml, true, state, _step256pp);
  const levelReq = calcLevelReq(base, [prefix, suffix]);
  const diff = ml < 12 ? 'Normal' : ml < 25 ? 'Nightmare' : 'Hell';
  const affixes = [prefix, suffix].filter(Boolean).map(a => (a as any).stat).join(', ');
  console.log(`[Blue]  ${name}  |  Level: ${levelReq}  |  Diff: ${diff}  |  Stats: ${affixes || '-'}`);
}

console.log('\n');

// 5 Yellow (Rare)
for (let i = 0; i < 5; i++) {
  const ml = 10 + i * 10;
  const base = ACT1_BASES[Number(_step256pp(state) % BigInt(ACT1_BASES.length))];
  const { prefix, suffix } = rollAffixes(base, ml, false, state, _step256pp);
  const parts = [prefix?.name, base.name, suffix?.name].filter(Boolean);
  const displayName = parts.join(' ');
  const levelReq = calcLevelReq(base, [prefix, suffix]);
  const diff = ml < 12 ? 'Normal' : ml < 25 ? 'Nightmare' : 'Hell';
  console.log(`[Yellow] ${displayName}  |  Level: ${levelReq}  |  Diff: ${diff}`);
}

console.log('\n═══ DONE ═══\n');
