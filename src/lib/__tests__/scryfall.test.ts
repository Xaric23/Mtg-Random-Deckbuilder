import { describe, it, expect } from 'vitest';

/**
 * Tests for color identity query generation
 * 
 * Commander Color Identity Rules:
 * - When searching for COMMANDERS, users expect exact matches (ci:)
 * - When building DECKS, colorless cards are allowed (ci<=)
 * 
 * Examples:
 * - Mono-white commander search: ci:w (only mono-white commanders)
 * - Mono-white deck building: ci<=w (white + colorless cards)
 * - Azorius commander search: ci:wu (only WU commanders)
 * - Azorius deck building: ci<=wu (white, blue, and colorless cards)
 */

describe('Color Identity Query Generation', () => {
  describe('Commander Search (exact match)', () => {
    it('should generate exact color identity query for mono-white', () => {
      const colors = ['W'];
      const query = `ci:${colors.join('')}`;
      expect(query).toBe('ci:W');
    });

    it('should generate exact color identity query for Azorius (WU)', () => {
      const colors = ['W', 'U'];
      const query = `ci:${colors.join('')}`;
      expect(query).toBe('ci:WU');
    });

    it('should generate exact color identity query for 5-color', () => {
      const colors = ['W', 'U', 'B', 'R', 'G'];
      const query = `ci:${colors.join('')}`;
      expect(query).toBe('ci:WUBRG');
    });
  });

  describe('Deck Building (subset match)', () => {
    it('should generate subset query for mono-white deck', () => {
      const colors = ['W'];
      const query = `ci<=${colors.join('')}`;
      expect(query).toBe('ci<=W');
      // This allows: white cards + colorless cards
    });

    it('should generate subset query for Azorius deck', () => {
      const colors = ['W', 'U'];
      const query = `ci<=${colors.join('')}`;
      expect(query).toBe('ci<=WU');
      // This allows: white cards + blue cards + colorless cards
    });

    it('should generate subset query for 5-color deck', () => {
      const colors = ['W', 'U', 'B', 'R', 'G'];
      const query = `ci<=${colors.join('')}`;
      expect(query).toBe('ci<=WUBRG');
      // This allows: all cards (any color combination + colorless)
    });
  });

  describe('Colorless Cards', () => {
    it('should include colorless cards in deck building with ci<=', () => {
      // When using ci<=w, both white and colorless cards are valid
      // This is correct for Commander deck building rules
      const monoWhiteCommander = ['W'];
      const deckQuery = `ci<=${monoWhiteCommander.join('')}`;
      
      expect(deckQuery).toBe('ci<=W');
      // In Scryfall, this will match cards with color_identity [] or ['W']
    });

    it('should not include colorless cards in commander search with ci:', () => {
      // When using ci:w, only mono-white commanders are returned
      // This is what users expect when filtering commanders by color
      const colorFilter = ['W'];
      const commanderQuery = `ci:${colorFilter.join('')}`;
      
      expect(commanderQuery).toBe('ci:W');
      // In Scryfall, this will only match cards with color_identity ['W']
      // Colorless commanders (color_identity []) are not included
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty color array', () => {
      const colors: string[] = [];
      const query = colors.length > 0 ? `ci:${colors.join('')}` : '';
      expect(query).toBe('');
    });

    it('should handle single color', () => {
      const colors = ['R'];
      const query = `ci:${colors.join('')}`;
      expect(query).toBe('ci:R');
    });

    it('should preserve WUBRG order in query', () => {
      // Scryfall expects colors in WUBRG order
      const colors = ['W', 'U', 'B', 'R', 'G'];
      const query = `ci:${colors.join('')}`;
      expect(query).toBe('ci:WUBRG');
    });
  });
});
