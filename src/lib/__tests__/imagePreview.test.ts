import { describe, it, expect } from 'vitest';
import type { Card } from '../types';
import { normalImage } from '../deck';

describe('Image URL preservation in Card type', () => {
  it('should preserve image_uris from Scryfall API response', () => {
    const mockCard: Card = {
      id: 'test-id',
      name: 'Test Card',
      image_uris: {
        small: 'https://example.com/small.jpg',
        normal: 'https://example.com/normal.jpg',
        large: 'https://example.com/large.jpg',
        png: 'https://example.com/card.png'
      }
    };

    expect(mockCard.image_uris).toBeDefined();
    expect(mockCard.image_uris?.normal).toBe('https://example.com/normal.jpg');
  });

  it('should extract normal image URL using normalImage function', () => {
    const mockCard: Card = {
      id: 'test-id',
      name: 'Test Card',
      image_uris: {
        normal: 'https://example.com/normal.jpg',
        large: 'https://example.com/large.jpg'
      }
    };

    const imageUrl = normalImage(mockCard);
    expect(imageUrl).toBe('https://example.com/normal.jpg');
  });

  it('should handle card faces with image_uris', () => {
    const mockCard: Card = {
      id: 'test-id',
      name: 'Double-Faced Card',
      card_faces: [{
        name: 'Front Face',
        image_uris: {
          normal: 'https://example.com/face-normal.jpg'
        }
      }]
    };

    const imageUrl = normalImage(mockCard);
    expect(imageUrl).toBe('https://example.com/face-normal.jpg');
  });

  it('should have prices field in Card type', () => {
    const mockCard: Card = {
      id: 'test-id',
      name: 'Expensive Card',
      prices: {
        usd: '10.50',
        usd_foil: '25.00',
        eur: '12.00',
        tix: '5.00'
      }
    };

    expect(mockCard.prices).toBeDefined();
    expect(mockCard.prices?.usd).toBe('10.50');
  });
});
