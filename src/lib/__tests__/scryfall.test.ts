import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { searchCards, getRandomCard } from '../scryfall';

// Mock the fetch function
const mockFetch = vi.fn() as Mock;
global.fetch = mockFetch;

describe('scryfall color identity handling', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should sort color identity to WUBRG order for searchCards', async () => {
    const mockResponse = {
      data: [],
      has_more: false,
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    // Call with colors in non-WUBRG order
    await searchCards('test', ['G', 'R']);

    // Verify the query was constructed with sorted colors (RG not GR)
    const fetchCall = mockFetch.mock.calls[0][0] as string;
    const decodedUrl = decodeURIComponent(fetchCall);
    expect(decodedUrl).toContain('ci<=RG');
    expect(decodedUrl).not.toContain('ci<=GR');
  });

  it('should sort 5-color identity correctly for searchCards', async () => {
    const mockResponse = {
      data: [],
      has_more: false,
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    // Call with colors in reverse order
    await searchCards('test', ['G', 'R', 'B', 'U', 'W']);

    // Verify the query was constructed with sorted colors
    const fetchCall = mockFetch.mock.calls[0][0] as string;
    const decodedUrl = decodeURIComponent(fetchCall);
    expect(decodedUrl).toContain('ci<=WUBRG');
  });

  it('should handle single color correctly for searchCards', async () => {
    const mockResponse = {
      data: [],
      has_more: false,
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await searchCards('test', ['R']);

    const fetchCall = mockFetch.mock.calls[0][0] as string;
    const decodedUrl = decodeURIComponent(fetchCall);
    expect(decodedUrl).toContain('ci<=R');
  });

  it('should handle empty color identity for searchCards', async () => {
    const mockResponse = {
      data: [],
      has_more: false,
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await searchCards('test', []);

    const fetchCall = mockFetch.mock.calls[0][0] as string;
    const decodedUrl = decodeURIComponent(fetchCall);
    expect(decodedUrl).toContain('ci<=');
    // Should have ci<= followed by space (no colors)
    expect(decodedUrl).toMatch(/ci<=\s/);
  });

  it('should sort color identity to WUBRG order for getRandomCard', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'Test Card', color_identity: ['R', 'G'] }),
    });

    // Call with colors in non-WUBRG order
    await getRandomCard(['G', 'R'], '-t:land');

    // Verify the query was constructed with sorted colors (RG not GR)
    const fetchCall = mockFetch.mock.calls[0][0] as string;
    const decodedUrl = decodeURIComponent(fetchCall);
    expect(decodedUrl).toContain('ci<=RG');
    expect(decodedUrl).not.toContain('ci<=GR');
  });

  it('should sort 3-color identity correctly for getRandomCard', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'Test Card', color_identity: ['B', 'R', 'G'] }),
    });

    // Call with colors in mixed order
    await getRandomCard(['G', 'R', 'B'], 't:creature');

    // Verify the query was constructed with sorted colors
    const fetchCall = mockFetch.mock.calls[0][0] as string;
    const decodedUrl = decodeURIComponent(fetchCall);
    expect(decodedUrl).toContain('ci<=BRG');
  });

  it('should handle all color combinations for getRandomCard', async () => {
    const testCases = [
      { input: ['U', 'R'], expected: 'UR' },
      { input: ['R', 'U'], expected: 'UR' },
      { input: ['W', 'B'], expected: 'WB' },
      { input: ['B', 'W'], expected: 'WB' },
      { input: ['W', 'G'], expected: 'WG' },
      { input: ['G', 'W'], expected: 'WG' },
    ];

    for (const tc of testCases) {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'Test Card', color_identity: tc.input }),
      });

      await getRandomCard(tc.input, '-t:land');

      const fetchCall = mockFetch.mock.calls[0][0] as string;
      const decodedUrl = decodeURIComponent(fetchCall);
      expect(decodedUrl).toContain(`ci<=${tc.expected}`);
      
      // Clear mock for next iteration
      mockFetch.mockClear();
    }
  });
});
