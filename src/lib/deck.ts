import type { Card } from './types';

export function cardName(c: Card | null): string {
  return c?.name || 'Unknown';
}

export function manaCost(c: Card | null): string {
  if (!c) return '';
  if (c.mana_cost) return c.mana_cost;
  if (c.card_faces && c.card_faces[0]?.mana_cost) return c.card_faces[0].mana_cost;
  return '';
}

export function manaValue(c: Card | null): number {
  return typeof c?.cmc === 'number' ? c.cmc : 0;
}

export function pipCounts(c: Card): { W: number; U: number; B: number; R: number; G: number; C: number } {
  const acc = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
  const sources: string[] = [];
  if (c?.mana_cost) sources.push(c.mana_cost);
  if (Array.isArray(c?.card_faces)) {
    for (const f of c.card_faces) if (f?.mana_cost) sources.push(f.mana_cost);
  }
  const re = /\{(\d+|W|U|B|R|G|C|S|X)\}/g;
  for (const s of sources) {
    const matches = s.matchAll(re);
    for (const m of matches) {
      const sym = m[1];
      if (sym in acc) acc[sym as keyof typeof acc]++;
    }
  }
  return acc;
}

export function smallImage(c: Card | null): string | null {
  if (!c) return null;
  if (c.image_uris?.small) return c.image_uris.small;
  if (c.card_faces && c.card_faces[0]?.image_uris?.small) return c.card_faces[0].image_uris.small;
  return null;
}

export function normalImage(c: Card | null): string | null {
  if (!c) return null;
  // Prefer normal-sized image for better readability
  if (c.image_uris?.normal) return c.image_uris.normal;
  if (c.image_uris?.large) return c.image_uris.large;
  if (c.image_uris?.png) return c.image_uris.png;
  // Fallback to small if normal not available
  if (c.image_uris?.small) return c.image_uris.small;
  // Check card faces
  if (c.card_faces && c.card_faces[0]?.image_uris) {
    if (c.card_faces[0].image_uris.normal) return c.card_faces[0].image_uris.normal;
    if (c.card_faces[0].image_uris.large) return c.card_faces[0].image_uris.large;
    if (c.card_faces[0].image_uris.png) return c.card_faces[0].image_uris.png;
    if (c.card_faces[0].image_uris.small) return c.card_faces[0].image_uris.small;
  }
  return null;
}

export function isLand(card: Card, mdfcAsLand: boolean): boolean {
  const tl = (card?.type_line || '').toLowerCase();
  if (tl.includes('land')) return true;
  if (mdfcAsLand && Array.isArray(card?.card_faces)) {
    return card.card_faces.some(f => (f.type_line || '').toLowerCase().includes('land'));
  }
  return false;
}

export function cardProducedMana(card: Card): string[] {
  if (Array.isArray(card?.produced_mana) && card.produced_mana.length) return card.produced_mana;
  if (Array.isArray(card?.card_faces)) {
    for (const f of card.card_faces) {
      if (Array.isArray(f.produced_mana) && f.produced_mana.length) return f.produced_mana;
    }
  }
  return [];
}

export function isColorlessOnly(card: Card): boolean {
  const pm = cardProducedMana(card);
  if (!pm.length) return true;
  const hasColor = pm.some(x => 'WUBRG'.includes(x));
  const hasOnlyC = pm.every(x => x === 'C');
  return !hasColor || hasOnlyC;
}

export function isBasicLand(card: Card): boolean {
  const tl = (card?.type_line || '').toLowerCase();
  return tl.includes('basic land');
}

export function isDuplicateInDeck(card: Card, deck: Card[]): boolean {
  if (isBasicLand(card)) return false;
  return deck.some(d => d.id === card.id);
}

export function countByTypeLine(deck: Card[]): {
  creature: number;
  instant: number;
  sorcery: number;
  artifact: number;
  enchantment: number;
  planeswalker: number;
  land: number;
} {
  const counters = { creature: 0, instant: 0, sorcery: 0, artifact: 0, enchantment: 0, planeswalker: 0, land: 0 };
  for (const c of deck) {
    const t = (c.type_line || '').toLowerCase();
    if (t.includes('creature')) counters.creature++;
    if (t.includes('instant')) counters.instant++;
    if (t.includes('sorcery')) counters.sorcery++;
    if (t.includes('artifact')) counters.artifact++;
    if (t.includes('enchantment')) counters.enchantment++;
    if (t.includes('planeswalker')) counters.planeswalker++;
    if (t.includes('land')) counters.land++;
  }
  return counters;
}

export function getBasicLandNamesForCI(ciStr: string): string[] {
  if (!ciStr || ciStr.length === 0) return ['Wastes'];
  const map: Record<string, string> = { W: 'Plains', U: 'Island', B: 'Swamp', R: 'Mountain', G: 'Forest' };
  const names: string[] = [];
  for (const ch of ciStr.split('')) {
    if (map[ch] && !names.includes(map[ch])) names.push(map[ch]);
  }
  return names.length ? names : ['Wastes'];
}

export function desiredBasicDistribution(nonlands: Card[]): {
  totals: { W: number; U: number; B: number; R: number; G: number };
  fractions: { W: number; U: number; B: number; R: number; G: number };
} {
  const totals = { W: 0, U: 0, B: 0, R: 0, G: 0 };
  for (const c of nonlands) {
    const pc = pipCounts(c);
    for (const k of Object.keys(totals) as Array<keyof typeof totals>) totals[k] += pc[k] || 0;
  }
  const sum = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
  const fractions = Object.fromEntries(
    Object.entries(totals).map(([k, v]) => [k, v / sum])
  ) as typeof totals;
  return { totals, fractions };
}

export function suggestLandCycles(ci: string[]): string {
  const set = new Set(ci);
  const out: string[] = [];
  if (set.size === 2) {
    out.push('Pathways, Pain lands, Check lands, Fast lands, Shock lands');
  } else if (set.size === 3) {
    out.push('Triomes, Pain lands, Check lands, Slow lands');
  } else if (set.size === 1) {
    out.push('Utility + basics; consider Blighted Woodland, War Room');
  } else if (set.size >= 4) {
    out.push('Triomes, Slow lands, Bond lands');
  }
  return out.join('; ');
}

export function producesCommanderColors(card: Card, commanderCI: string[]): boolean {
  const ciSet = new Set(commanderCI);
  const pm = cardProducedMana(card);
  return pm.some(x => ciSet.has(x));
}

export function colorPills(ciArr: string[] | undefined): string {
  if (!ciArr || !ciArr.length) return '<span class="pill">C</span>';
  return ciArr.map(x => `<span class="pill">${x}</span>`).join(' ');
}

