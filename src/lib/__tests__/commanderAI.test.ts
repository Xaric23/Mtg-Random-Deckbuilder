import { describe, it, expect } from 'vitest';
import type { Card } from '../types';
import { calculateStrategyScore, buildQueryForStrategy } from '../commanderAI';

describe('commanderAI', () => {
  it('buildQueryForStrategy returns a commander query', () => {
    const q = buildQueryForStrategy('aggro');
    expect(q).toContain('is:commander');
    expect(q.length).toBeGreaterThan(10);
  });

  it('scores aggro commander higher when keywords and power present', () => {
    const commander: Card = {
      id: 'c1',
      name: 'Fierce General',
      oracle_text: 'Haste. Whenever Fierce General attacks, it deals damage to each opponent.',
      type_line: 'Legendary Creature — Human Warrior',
      cmc: 5,
      power: '5',
      toughness: '4',
      color_identity: ['R'],
    };

    const neutral: Card = {
      id: 'c2',
      name: 'Neutral Sage',
      oracle_text: 'When Neutral Sage enters the battlefield, draw a card.',
      type_line: 'Legendary Creature — Human Wizard',
      cmc: 3,
      power: '1',
      toughness: '3',
      color_identity: ['U'],
    };

    const scoreAggro = calculateStrategyScore(commander, 'aggro');
    const scoreNeutral = calculateStrategyScore(neutral, 'aggro');

    expect(scoreAggro).toBeGreaterThan(scoreNeutral);
  });

  it('scores tribal commander higher for tribal strategy', () => {
    const tribalCommander: Card = {
      id: 't1',
      name: 'Lord of Wolves',
      oracle_text: 'Other Wolf creatures you control get +1/+1.',
      type_line: 'Legendary Creature — Wolf',
      cmc: 4,
      power: '3',
      toughness: '3',
      color_identity: ['G'],
    };

    const nonTribal: Card = {
      id: 't2',
      name: 'Generic Creature',
      oracle_text: 'When Generic Creature enters the battlefield, gain 1 life.',
      type_line: 'Legendary Creature — Human',
      cmc: 4,
      power: '3',
      toughness: '3',
      color_identity: ['G'],
    };

    const s1 = calculateStrategyScore(tribalCommander, 'tribal');
    const s2 = calculateStrategyScore(nonTribal, 'tribal');
    expect(s1).toBeGreaterThan(s2);
  });
});
