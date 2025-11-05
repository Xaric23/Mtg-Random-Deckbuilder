import type { Card } from './types';

const EXCLUDE_ALCHEMY = ' -set:alchemy -set:ana game:paper';

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchCardById(id: string): Promise<Card | null> {
  try {
    const res = await fetch(`https://api.scryfall.com/cards/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchNamedCard(name: string): Promise<Card | null> {
  try {
    const res = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchRandomCard(query: string): Promise<Card | null> {
  try {
    const res = await fetch(`https://api.scryfall.com/cards/random?q=${encodeURIComponent(query + EXCLUDE_ALCHEMY)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function searchScryfall(query: string, limit = 100): Promise<Card[]> {
  const excludeAlchemy = EXCLUDE_ALCHEMY;
  let url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query + excludeAlchemy)}`;
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
  const ci = colorIdentity.join('');
  const q = `${query} ci<=${ci}`;
  return searchScryfall(q, 120);
}

export async function getRandomCommander(): Promise<Card | null> {
  return fetchRandomCard('is:commander legal:commander');
}

export async function getRandomCard(colorIdentity: string[], filterQuery: string): Promise<Card | null> {
  const ci = colorIdentity.join('');
  const q = `ci<=${ci} legal:commander ${filterQuery}`;
  return fetchRandomCard(q);
}

