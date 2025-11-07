/**
 * Scryfall API utilities based on scryfall-mcp server
 * This module provides the core Scryfall API interaction logic
 * shared with the external/scryfall-mcp server
 */

import type { Card } from './types';

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

/**
 * Handle Scryfall API responses
 * Based on scryfall-mcp server error handling pattern
 */
async function handleScryfallResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    let errorObj;
    try {
      errorObj = JSON.parse(errorText);
    } catch {
      throw new ScryfallError(
        `HTTP error ${response.status}: ${response.statusText}`,
        response.status,
        errorText
      );
    }
    
    if (errorObj && errorObj.object === 'error') {
      throw new ScryfallError(
        `Scryfall error: ${errorObj.details || errorObj.code}`,
        errorObj.status || response.status,
        errorObj.details
      );
    }
    
    throw new ScryfallError(
      `HTTP error ${response.status}: ${response.statusText}`,
      response.status,
      errorText
    );
  }

  const data = await response.json();
  if (!data || typeof data !== 'object') {
    throw new ScryfallError('Invalid data received from Scryfall');
  }
  
  return data as T;
}

/**
 * Search for cards - based on scryfall-mcp search_cards tool
 */
export async function searchCards(query: string): Promise<{ data: Card[]; has_more?: boolean; next_page?: string }> {
  await waitForRateLimit();
  const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  return handleScryfallResponse(response);
}

/**
 * Get a card by ID - based on scryfall-mcp get_card_by_id tool
 */
export async function getCardById(id: string): Promise<Card> {
  await waitForRateLimit();
  const url = `https://api.scryfall.com/cards/${encodeURIComponent(id)}`;
  const response = await fetch(url);
  return handleScryfallResponse(response);
}

/**
 * Get a card by exact name - based on scryfall-mcp get_card_by_name tool
 */
export async function getCardByName(name: string): Promise<Card> {
  await waitForRateLimit();
  const url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`;
  const response = await fetch(url);
  return handleScryfallResponse(response);
}

/**
 * Get a random card - based on scryfall-mcp random_card tool
 */
export async function getRandomCard(query?: string): Promise<Card> {
  await waitForRateLimit();
  const url = query
    ? `https://api.scryfall.com/cards/random?q=${encodeURIComponent(query)}`
    : 'https://api.scryfall.com/cards/random';
  const response = await fetch(url);
  return handleScryfallResponse(response);
}

/**
 * Get rulings for a card - based on scryfall-mcp get_rulings tool
 */
export async function getRulings(id: string): Promise<{ data: Array<{ source: string; published_at: string; comment: string }> }> {
  await waitForRateLimit();
  const url = `https://api.scryfall.com/cards/${encodeURIComponent(id)}/rulings`;
  const response = await fetch(url);
  return handleScryfallResponse(response);
}

/**
 * Get prices for a card by ID - based on scryfall-mcp get_prices_by_id tool
 */
export async function getPricesById(id: string): Promise<{ usd?: string | null; usd_foil?: string | null; eur?: string | null; tix?: string | null }> {
  await waitForRateLimit();
  const url = `https://api.scryfall.com/cards/${encodeURIComponent(id)}`;
  const response = await fetch(url);
  const data = await handleScryfallResponse<Card>(response);
  
  if (!data.prices) {
    return {};
  }
  
  return data.prices;
}

/**
 * Get prices for a card by name - based on scryfall-mcp get_prices_by_name tool
 */
export async function getPricesByName(name: string): Promise<{ usd?: string | null; usd_foil?: string | null; eur?: string | null; tix?: string | null }> {
  await waitForRateLimit();
  const url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`;
  const response = await fetch(url);
  const data = await handleScryfallResponse<Card>(response);
  
  if (!data.prices) {
    return {};
  }
  
  return data.prices;
}

export { ScryfallError };
