import { describe, it, expect } from 'vitest';
import { cardName, manaCost, manaValue, pipCounts } from '../deck';
import type { Card } from '../types';

describe('deck utilities', () => {
  it('should get card name', () => {
    const card = { name: 'Lightning Bolt' } as Card;
    expect(cardName(card)).toBe('Lightning Bolt');
    expect(cardName(null)).toBe('Unknown');
  });

  it('should get mana cost', () => {
    const card = { mana_cost: '{1}{R}' } as Card;
    expect(manaCost(card)).toBe('{1}{R}');
    expect(manaCost(null)).toBe('');

    const doubleCard = {
      card_faces: [
        { mana_cost: '{2}{U}' }
      ]
    } as Card;
    expect(manaCost(doubleCard)).toBe('{2}{U}');
  });

  it('should get mana value', () => {
    const card = { cmc: 2 } as Card;
    expect(manaValue(card)).toBe(2);
    expect(manaValue(null)).toBe(0);
  });
});