import type { Card, SavedDeck } from './types';

const STATE_KEY = 'edh_builder_state';
const SAVED_DECKS_KEY = 'edh_saved_decks';
const DARK_MODE_KEY = 'edh_dark_mode';

export function saveState(commander: Card | null, deck: Card[]): void {
  if (typeof window === 'undefined') return;
  const state = {
    commanderId: commander?.id || null,
    deckIds: deck.map(c => c.id),
  };
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
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

