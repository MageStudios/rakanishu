/* @refresh reload */
import { BaseItem } from '../data/items/bases';
import { ALL_AFFIXES, MagicAffix } from '../data/items/affixes';

export interface MagicItem {
  base: BaseItem;
  name: string;
  prefix?: MagicAffix;
  suffix?: MagicAffix;
  levelReq: number;
}

export function rollAffixes(
  base: BaseItem,
  monsterLevel: number,
  isMagic: boolean,
  state: BigUint64Array,
  _step256pp: (s: BigUint64Array) => bigint,
): { prefix?: MagicAffix; suffix?: MagicAffix; name: string } {
  const diffIdx = monsterLevel < 12 ? 0 : monsterLevel < 25 ? 1 : 2;

  if (isMagic) {
    const eligible = ALL_AFFIXES.filter(a => a.levelReq[diffIdx] <= monsterLevel);
    if (eligible.length === 0) return { name: base.name };
    const idx = Number(_step256pp(state) % BigInt(eligible.length));
    const affix = eligible[idx];
    const name = affix.type === 'PREFIX'
      ? `${affix.name} ${base.name}`
      : `${base.name} ${affix.name}`;
    return { [affix.type === 'PREFIX' ? 'prefix' : 'suffix']: affix, name };
  }

  // Rare: 1-2 prefix + 1-2 suffix
  const prefixes = ALL_AFFIXES.filter(a => a.type === 'PREFIX' && a.levelReq[diffIdx] <= monsterLevel);
  const suffixes = ALL_AFFIXES.filter(a => a.type === 'SUFFIX' && a.levelReq[diffIdx] <= monsterLevel);

  const prefCount = Number(_step256pp(state) % 2n) + 1;
  const suffCount = Number(_step256pp(state) % 2n) + 1;

  const pick = <T>(arr: T[]): T | undefined => {
    if (arr.length === 0) return undefined;
    return arr[Number(_step256pp(state) % BigInt(arr.length))];
  };

  const p1 = pick(prefixes);
  const p2 = Number(prefCount) > 1 ? pick(prefixes) : undefined;
  const s1 = pick(suffixes);
  const s2 = Number(suffCount) > 1 ? pick(suffixes) : undefined;

  const name = `${p1?.name ?? ''} ${p2?.name ?? ''} ${base.name} ${s1?.name ?? ''} ${s2?.name ?? ''}`.trim();
  return { prefix: p1, suffix: s1, name };
}

export function calcLevelReq(base: BaseItem, affixes: (MagicAffix | undefined)[]): number {
  const allReqs = affixes.flatMap(a => a?.levelReq ?? []);
  return Math.max(base.requirements.level, ...allReqs.filter(n => !isNaN(n)));
}
