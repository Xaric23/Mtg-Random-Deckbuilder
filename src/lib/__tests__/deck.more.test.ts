import { describe, it, expect } from 'vitest';
import {
  pipCounts,
  smallImage,
  normalImage,
  isLand,
  cardProducedMana,
  isColorlessOnly,
  isBasicLand,
  isDuplicateInDeck,
  countByTypeLine,
  getBasicLandNamesForCI,
  desiredBasicDistribution,
  suggestLandCycles,
  producesCommanderColors,
  colorPills,
} from '../deck';

import type { Card } from '../types';

describe('deck utilities - additional coverage', () => {
  it('pipCounts parses mana symbols and counts colors', () => {
    const c = { mana_cost: '{W}{U}{1}{C}{G}{W}' } as Card;
    const p = pipCounts(c);
    expect(p.W).toBe(2);
    expect(p.U).toBe(1);
    expect(p.C).toBe(1);
    expect(p.G).toBe(1);
    expect(p.B).toBe(0);
    expect(p.R).toBe(0);
  });

  it('smallImage prefers image_uris.small then card_faces', () => {
    const a = { image_uris: { small: 'a.png' } } as Card;
    expect(smallImage(a)).toBe('a.png');

    const b = { card_faces: [{ image_uris: { small: 'b.png' } }] } as Card;
    expect(smallImage(b)).toBe('b.png');

    expect(smallImage(null)).toBeNull();
  });

  it('normalImage falls back through size priorities and card faces', () => {
    expect(normalImage(null)).toBeNull();

    const c1 = { image_uris: { normal: 'n.png' } } as Card;
    expect(normalImage(c1)).toBe('n.png');

    const c2 = { image_uris: { large: 'l.png' } } as Card;
    expect(normalImage(c2)).toBe('l.png');

    const c3 = { card_faces: [{ image_uris: { normal: 'fn.png' } }] } as Card;
    expect(normalImage(c3)).toBe('fn.png');
  });

  it('isLand and mdfcAsLand behavior', () => {
    const land = { type_line: 'Basic Land — Forest' } as Card;
    expect(isLand(land, false)).toBe(true);

    const md = { type_line: 'Artifact', card_faces: [{ type_line: 'Land' }] } as Card;
    expect(isLand(md, true)).toBe(true);
  });

  it('cardProducedMana and isColorlessOnly', () => {
    const c = { produced_mana: ['G', 'C'] } as Card;
    expect(cardProducedMana(c)).toEqual(['G', 'C']);
    expect(isColorlessOnly(c)).toBe(false);

    const c2 = { produced_mana: ['C'] } as Card;
    expect(isColorlessOnly(c2)).toBe(true);

    const c3 = {} as Card;
    expect(isColorlessOnly(c3)).toBe(true);
  });

  it('isBasicLand and isDuplicateInDeck logic', () => {
    const basic = { type_line: 'Basic Land — Island', id: '1' } as Card;
    const deck = [{ id: '1' } as Card];
    expect(isBasicLand(basic)).toBe(true);
    expect(isDuplicateInDeck(basic, deck)).toBe(false);

    const nonbasic = { type_line: 'Creature — Elf', id: '2' } as Card;
    expect(isDuplicateInDeck(nonbasic, [{ id: '2' } as Card])).toBe(true);
  });

  it('countByTypeLine aggregates correctly', () => {
    const deck = [
      { type_line: 'Creature' } as Card,
      { type_line: 'Instant' } as Card,
      { type_line: 'Sorcery' } as Card,
      { type_line: 'Artifact' } as Card,
      { type_line: 'Enchantment' } as Card,
      { type_line: 'Planeswalker' } as Card,
      { type_line: 'Land' } as Card,
    ];
    const counts = countByTypeLine(deck as Card[]);
    expect(counts.creature).toBe(1);
    expect(counts.land).toBe(1);
  });

  it('getBasicLandNamesForCI maps correctly', () => {
    expect(getBasicLandNamesForCI('WUR')).toEqual(['Plains', 'Island', 'Mountain']);
    expect(getBasicLandNamesForCI('')).toEqual(['Wastes']);
  });

  it('desiredBasicDistribution returns fractions summing to ~1', () => {
    const cards = [ { mana_cost: '{W}{U}{G}' } as Card, { mana_cost: '{W}{W}' } as Card ];
    const res = desiredBasicDistribution(cards);
    const sum = Object.values(res.fractions).reduce((a,b) => a + b, 0);
    expect(sum).toBeGreaterThan(0.99);
    expect(sum).toBeLessThan(1.01);
  });

  it('suggestLandCycles returns recommendations', () => {
    expect(suggestLandCycles(['W','U']).includes('Pathways')).toBe(true);
    expect(suggestLandCycles(['W','U','B']).includes('Triomes')).toBe(true);
  });

  it('producesCommanderColors and colorPills', () => {
    const c = { produced_mana: ['G'] } as Card;
    expect(producesCommanderColors(c, ['G'])).toBe(true);
    expect(colorPills(['G','R'])).toContain('G');
    expect(colorPills(undefined)).toContain('C');
  });
});
