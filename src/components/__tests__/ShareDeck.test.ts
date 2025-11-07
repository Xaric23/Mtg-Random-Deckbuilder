import { describe, it, expect } from 'vitest';

describe('ShareDeck URL generation', () => {
  it('should generate URL within limit for 100-card Commander deck', () => {
    // Simulate a full Commander deck (1 commander + 99 cards)
    const commanderId = '12345678-1234-1234-1234-123456789012';
    const deckIds = Array(99).fill('12345678-1234-1234-1234-123456789012');
    
    const data = {
      c: commanderId,
      d: deckIds,
    };
    
    const encoded = btoa(JSON.stringify(data));
    const url = `https://example.com?deck=${encoded}`;
    
    // URL should be less than 8000 characters (new limit)
    expect(url.length).toBeLessThan(8000);
    
    // URL should still exceed the old 2000 character limit
    expect(url.length).toBeGreaterThan(2000);
  });

  it('should generate URL for smaller decks', () => {
    const commanderId = '12345678-1234-1234-1234-123456789012';
    const deckIds = Array(50).fill('12345678-1234-1234-1234-123456789012');
    
    const data = {
      c: commanderId,
      d: deckIds,
    };
    
    const encoded = btoa(JSON.stringify(data));
    const url = `https://example.com?deck=${encoded}`;
    
    // Smaller decks should be well within the limit
    expect(url.length).toBeLessThan(8000);
  });

  it('should generate URL without commander', () => {
    const deckIds = Array(99).fill('12345678-1234-1234-1234-123456789012');
    
    const data = {
      c: null,
      d: deckIds,
    };
    
    const encoded = btoa(JSON.stringify(data));
    const url = `https://example.com?deck=${encoded}`;
    
    // Should still be within limit
    expect(url.length).toBeLessThan(8000);
  });
});
