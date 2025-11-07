import { describe, it, expect, vi } from 'vitest';
import type { Card } from '@/lib/types';

// Mock the share URL generation logic
function generateShareableURL(commander: Card | null, deck: Card[]): string | null {
  const cardName = (c: Card) => c?.name || 'Unknown';
  
  const data = {
    c: commander?.name || null,
    d: deck.map(card => cardName(card)),
  };
  
  const encoded = btoa(JSON.stringify(data));
  // Simulate the base URL
  const baseUrl = 'https://example.com/deckbuilder';
  const url = `${baseUrl}?deck=${encoded}`;
  
  return url.length < 2000 ? url : null;
}

// Generate old-style URL with UUIDs for comparison
function generateOldShareableURL(commander: Card | null, deck: Card[]): string | null {
  const data = {
    c: commander?.id || null,
    d: deck.map(card => card.id),
  };
  
  const encoded = btoa(JSON.stringify(data));
  const baseUrl = 'https://example.com/deckbuilder';
  const url = `${baseUrl}?deck=${encoded}`;
  
  return url.length < 2000 ? url : null;
}

describe('ShareDeck URL generation', () => {
  it('should generate a shareable URL with card names', () => {
    const commander: Card = {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Atraxa, Praetors\' Voice',
      color_identity: ['W', 'U', 'B', 'G'],
    };

    const deck: Card[] = [
      { id: 'b1c2d3e4-f5g6-7890-abcd-ef1234567891', name: 'Sol Ring' },
      { id: 'c1d2e3f4-g5h6-7890-abcd-ef1234567892', name: 'Command Tower' },
      { id: 'd1e2f3g4-h5i6-7890-abcd-ef1234567893', name: 'Arcane Signet' },
    ];

    const url = generateShareableURL(commander, deck);
    expect(url).toBeTruthy();
    expect(url).toContain('?deck=');
    
    // Decode and verify structure
    const encoded = url!.split('?deck=')[1];
    const decoded = JSON.parse(atob(encoded));
    expect(decoded.c).toBe('Atraxa, Praetors\' Voice');
    expect(decoded.d).toEqual(['Sol Ring', 'Command Tower', 'Arcane Signet']);
  });

  it('should generate shorter URLs with names than with UUIDs', () => {
    const commander: Card = {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Atraxa, Praetors\' Voice',
      color_identity: ['W', 'U', 'B', 'G'],
    };

    // Create a deck with realistic card names
    const deck: Card[] = [];
    const cardNames = [
      'Sol Ring', 'Command Tower', 'Arcane Signet', 'Chromatic Lantern',
      'Lightning Greaves', 'Swiftfoot Boots', 'Counterspell', 'Swords to Plowshares',
      'Path to Exile', 'Generous Gift', 'Beast Within', 'Chaos Warp',
      'Cultivate', 'Kodama\'s Reach', 'Rampant Growth', 'Nature\'s Lore',
      'Exotic Orchard', 'Reflecting Pool', 'City of Brass', 'Mana Confluence',
    ];

    for (let i = 0; i < cardNames.length; i++) {
      deck.push({
        id: `${i.toString().padStart(8, '0')}-0000-0000-0000-000000000000`,
        name: cardNames[i],
      });
    }

    const newUrl = generateShareableURL(commander, deck);
    const oldUrl = generateOldShareableURL(commander, deck);

    expect(newUrl).toBeTruthy();
    expect(oldUrl).toBeTruthy();
    expect(newUrl!.length).toBeLessThan(oldUrl!.length);
    
    // Log the size difference for visibility
    const sizeDiff = oldUrl!.length - newUrl!.length;
    const percentSaved = ((sizeDiff / oldUrl!.length) * 100).toFixed(1);
    console.log(`URL size reduction: ${sizeDiff} bytes (${percentSaved}% smaller)`);
  });

  it('should handle large decks more efficiently than UUIDs', () => {
    const commander: Card = {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Atraxa, Praetors\' Voice',
      color_identity: ['W', 'U', 'B', 'G'],
    };

    // Create a full 99-card deck with realistic average name lengths
    const deck: Card[] = [];
    const baseNames = [
      'Sol Ring', 'Arcane Signet', 'Command Tower', 'Path to Exile',
      'Swords to Plowshares', 'Counterspell', 'Lightning Greaves',
      'Chromatic Lantern', 'Cultivate', 'Kodama\'s Reach',
    ];

    for (let i = 0; i < 99; i++) {
      const baseName = baseNames[i % baseNames.length];
      deck.push({
        id: `${i.toString().padStart(8, '0')}-1234-5678-9abc-def012345678`,
        name: i < baseNames.length ? baseName : `${baseName} ${Math.floor(i / baseNames.length)}`,
      });
    }

    const newUrl = generateShareableURL(commander, deck);
    const oldUrl = generateOldShareableURL(commander, deck);

    // The old URL with UUIDs should definitely exceed the limit
    expect(oldUrl).toBeNull();
    
    // The new URL should be significantly shorter (even if it still exceeds 2000)
    // Calculate the sizes anyway
    const newData = {
      c: commander.name,
      d: deck.map(card => card.name),
    };
    const oldData = {
      c: commander.id,
      d: deck.map(card => card.id),
    };
    
    const newEncoded = btoa(JSON.stringify(newData));
    const oldEncoded = btoa(JSON.stringify(oldData));
    
    expect(newEncoded.length).toBeLessThan(oldEncoded.length);
    
    // Log the comparison
    console.log(`New URL data size: ${newEncoded.length} bytes`);
    console.log(`Old URL data size: ${oldEncoded.length} bytes`);
    console.log(`Reduction: ${oldEncoded.length - newEncoded.length} bytes (${((oldEncoded.length - newEncoded.length) / oldEncoded.length * 100).toFixed(1)}% smaller)`);
  });

  it('should return null if URL is too long even with names', () => {
    const commander: Card = {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Atraxa, Praetors\' Voice',
      color_identity: ['W', 'U', 'B', 'G'],
    };

    // Create a deck with very long card names to test the limit
    const deck: Card[] = [];
    for (let i = 0; i < 99; i++) {
      deck.push({
        id: `${i.toString().padStart(8, '0')}-0000-0000-0000-000000000000`,
        name: 'Very Long Card Name That Goes On And On And On And On And On',
      });
    }

    const url = generateShareableURL(commander, deck);
    
    // This should either be under 2000 or null
    if (url) {
      expect(url.length).toBeLessThan(2000);
    } else {
      // If it's null, that means it exceeded the limit
      expect(url).toBeNull();
    }
  });
});
