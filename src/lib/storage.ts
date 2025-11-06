import type { Card, SavedDeck } from './types';

const STATE_KEY = 'edh_builder_state';
const SAVED_DECKS_KEY = 'edh_saved_decks';
const DARK_MODE_KEY = 'edh_dark_mode';

import { validateStorageKey, validateCardId } from './validation';

export function saveState(commander: Card | null, deck: Card[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Validate card IDs
    if (commander?.id && !validateCardId(commander.id)) {
      throw new Error('Invalid commander ID');
    }
    
    const validDeckIds = deck
      .map(c => c.id)
      .filter(id => validateCardId(id));
      
    const state = {
      commanderId: commander?.id || null,
      deckIds: validDeckIds,
    };
    
    if (!validateStorageKey(STATE_KEY)) {
      throw new Error('Invalid storage key');
    }
    
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving state:', error);
  }
}

export function loadState(): { commanderId: string | null; deckIds: string[] } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getSavedDecks(): Record<string, SavedDeck> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(SAVED_DECKS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function setSavedDecks(decks: Record<string, SavedDeck>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SAVED_DECKS_KEY, JSON.stringify(decks));
}

export function getDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DARK_MODE_KEY) === '1';
}

export function setDarkMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DARK_MODE_KEY, enabled ? '1' : '0');
}

const OWNED_CARDS_KEY = 'edh_owned_cards';

export function getOwnedCards(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(OWNED_CARDS_KEY);
    if (!raw) return new Set();
    const cards = JSON.parse(raw);
    return new Set(Array.isArray(cards) ? cards : []);
  } catch {
    return new Set();
  }
}

export function setOwnedCards(cards: Set<string> | string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const array = Array.from(cards);
    localStorage.setItem(OWNED_CARDS_KEY, JSON.stringify(array));
  } catch (e) {
    console.warn('Error saving owned cards:', e);
  }
}

export function addOwnedCard(cardId: string): void {
  const owned = getOwnedCards();
  owned.add(cardId);
  setOwnedCards(owned);
}

export function removeOwnedCard(cardId: string): void {
  const owned = getOwnedCards();
  owned.delete(cardId);
  setOwnedCards(owned);
}

export function isOwned(cardId: string): boolean {
  return getOwnedCards().has(cardId);
}

