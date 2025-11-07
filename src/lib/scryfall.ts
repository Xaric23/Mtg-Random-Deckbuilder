import type { Card } from './types';
import { getCardById, getCardByName, getRandomCard as getRandomCardApi, searchCards as searchCardsApi } from './scryfallApi';

const EXCLUDE_ALCHEMY = ' -set:alchemy -set:ana game:paper';

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch a card by ID using scryfall-mcp based API
 */
export async function fetchCardById(id: string): Promise<Card> {
  return getCardById(id);
}

/**
 * Fetch a card by exact name using scryfall-mcp based API
 */
export async function fetchNamedCard(name: string): Promise<Card> {
  return getCardByName(name);
}

/**
 * Fetch a random card using scryfall-mcp based API
 */
export async function fetchRandomCard(query: string): Promise<Card | null> {
  try {
    return await getRandomCardApi(query + EXCLUDE_ALCHEMY);
  } catch (error) {
    console.error('Error fetching random card:', error);
    return null;
  }
}

/**
 * Search Scryfall with pagination support using scryfall-mcp based API
 */
export async function searchScryfall(query: string, limit = 100): Promise<Card[]> {
  const out: Card[] = [];
  let nextPage: string | undefined;
  
  for (let guard = 0; guard < 8 && out.length < limit; guard++) {
    try {
      const data = await searchCardsApi(query + EXCLUDE_ALCHEMY);
      if (Array.isArray(data.data)) out.push(...data.data);
      if (!data.has_more || !data.next_page) break;
      
      // For pagination, we need to make a direct fetch call
      nextPage = data.next_page;
      if (nextPage) {
        await sleep(60);
        const response = await fetch(nextPage);
        const pageData = await response.json();
        if (Array.isArray(pageData.data)) out.push(...pageData.data);
        if (!pageData.has_more || !pageData.next_page) break;
        nextPage = pageData.next_page;
      }
    } catch {
      break;
    }
  }
  
  return out.slice(0, limit);
}

/**
 * Search for commander cards using scryfall-mcp based API
 */
export async function searchCommanders(query: string): Promise<Card[]> {
  const q = `${query} is:commander legal:commander`;
  return searchScryfall(q, 60);
}

/**
 * Search for cards with color identity filter using scryfall-mcp based API
 */
export async function searchCards(query: string, colorIdentity: string[]): Promise<Card[]> {
  const ci = colorIdentity.join('');
  const q = `${query} ci<=${ci}`;
  return searchScryfall(q, 120);
}

/**
 * Get a random commander using scryfall-mcp based API
 */
export async function getRandomCommander(): Promise<Card | null> {
  return fetchRandomCard('is:commander legal:commander');
}

/**
 * Get a random card with color identity filter using scryfall-mcp based API
 */
export async function getRandomCard(colorIdentity: string[], filterQuery: string): Promise<Card | null> {
  const ci = colorIdentity.join('');
  const q = `ci<=${ci} legal:commander ${filterQuery}`;
  return fetchRandomCard(q);
}

