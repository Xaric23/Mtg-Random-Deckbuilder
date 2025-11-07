import type { Card } from './types';

const EXCLUDE_ALCHEMY = ' -set:alchemy -set:ana game:paper';

// WUBRG color order required by Scryfall API
const WUBRG_ORDER = ['W', 'U', 'B', 'R', 'G'];

/**
 * Sort color identity to WUBRG order for Scryfall queries.
 * Scryfall's ci<= operator requires colors in WUBRG order.
 */
function sortColorsToWUBRG(colors: string[]): string[] {
  if (!colors || colors.length === 0) return [];
  return colors.slice().sort((a, b) => {
    const idxA = WUBRG_ORDER.indexOf(a);
    const idxB = WUBRG_ORDER.indexOf(b);
    return idxA - idxB;
  });
}

// Rate limiting - Scryfall allows up to 10 requests per second
const REQUEST_DELAY = 100; // ms between requests
let lastRequestTime = 0;

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < REQUEST_DELAY) {
    await sleep(REQUEST_DELAY - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class ScryfallError extends Error {
  constructor(message: string, public status?: number, public details?: string) {
    super(message);
    this.name = 'ScryfallError';
  }
}

export async function fetchCardById(id: string): Promise<Card> {
  try {
    await waitForRateLimit();
    const res = await fetch(`https://api.scryfall.com/cards/${id}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new ScryfallError(
        'Failed to fetch card by ID',
        res.status,
        errorText
      );
    }

    const data = await res.json();
    if (!data || typeof data !== 'object') {
      throw new ScryfallError('Invalid card data received');
    }

    return data;
  } catch (error) {
    if (error instanceof ScryfallError) {
      throw error;
    }
    throw new ScryfallError(
      'Error fetching card',
      undefined,
      error instanceof Error ? error.message : String(error)
    );
  }
}

export async function fetchNamedCard(name: string): Promise<Card> {
  try {
    await waitForRateLimit();
    const res = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new ScryfallError(
        'Failed to fetch card by name',
        res.status,
        errorText
      );
    }

    const data = await res.json();
    if (!data || typeof data !== 'object') {
      throw new ScryfallError('Invalid card data received');
    }

    return data;
  } catch (error) {
    if (error instanceof ScryfallError) {
      throw error;
    }
    throw new ScryfallError(
      'Error fetching card',
      undefined,
      error instanceof Error ? error.message : String(error)
    );
  }
}

export async function fetchRandomCard(query: string): Promise<Card | null> {
  try {
    await waitForRateLimit();
    const res = await fetch(`https://api.scryfall.com/cards/random?q=${encodeURIComponent(query + EXCLUDE_ALCHEMY)}`);
    if (!res.ok) {
      console.error(`Scryfall API error: ${res.status} - ${await res.text()}`);
      return null;
    }
    const data = await res.json();
    if (!data) throw new Error('Invalid card data received');
    return data;
  } catch (error) {
    console.error('Error fetching random card:', error);
    return null;
  }
}

export async function searchScryfall(query: string, limit = 100): Promise<Card[]> {
  let url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query + EXCLUDE_ALCHEMY)}`;
  const out: Card[] = [];
  
  for (let guard = 0; guard < 8 && out.length < limit; guard++) {
    try {
      const data = await fetch(url).then(res => res.json());
      if (Array.isArray(data.data)) out.push(...data.data);
      if (!data.has_more || !data.next_page) break;
      url = data.next_page;
      await sleep(60);
    } catch {
      break;
    }
  }
  
  return out.slice(0, limit);
}

export async function searchCommanders(query: string): Promise<Card[]> {
  const q = `${query} is:commander legal:commander`;
  return searchScryfall(q, 60);
}

export async function searchCards(query: string, colorIdentity: string[]): Promise<Card[]> {
  const sortedColors = sortColorsToWUBRG(colorIdentity);
  const ci = sortedColors.join('');
  const q = `${query} ci<=${ci}`;
  return searchScryfall(q, 120);
}

export async function getRandomCommander(): Promise<Card | null> {
  return fetchRandomCard('is:commander legal:commander');
}

export async function getRandomCard(colorIdentity: string[], filterQuery: string): Promise<Card | null> {
  const sortedColors = sortColorsToWUBRG(colorIdentity);
  const ci = sortedColors.join('');
  const q = `ci<=${ci} legal:commander ${filterQuery}`;
  return fetchRandomCard(q);
}

