'use client';

import { useState, useCallback } from 'react';
import type { Card } from '@/lib/types';
import { cardName, manaCost } from '@/lib/deck';
import { searchCards } from '@/lib/scryfall';
import { ErrorBoundary } from './ErrorBoundary';

interface CardSearchProps {
  commander: Card | null;
  deck: Card[];
  onAddCard: (card: Card) => void;
  onGenerateRandomDeck: () => void;
  mdfcAsLand: boolean;
  setMdfcAsLand: (value: boolean) => void;
  targetLands: number;
  setTargetLands: (value: number) => void;
  basicsPercent: number;
  setBasicsPercent: (value: number) => void;
  preferColorLands: boolean;
  setPreferColorLands: (value: boolean) => void;
  avoidColorlessLands: boolean;
  setAvoidColorlessLands: (value: boolean) => void;
  onHover?: (card: Card | null, e: React.MouseEvent) => void;
  onMouseLeave?: () => void;
  generatingDeck?: boolean;
  deckGenStatus?: string;
}

const QUICK_FILTERS = {
  ramp: 't:artifact ((o:"add {" or o:mana) or o:"search your library for a land")',
  draw: '(o:"draw a card" or o:"draw two" or o:investigate)',
  removal: '(o:"destroy target" or o:"exile target" or o:"deals damage to target creature")',
  boardwipe: '(o:"destroy all" or o:"each creature" or o:"all creatures" or o:"sacrifice all")',
  tutor: '(o:"search your library" -t:land)',
};

export function CardSearch({
  commander,
  deck,
  onAddCard,
  onGenerateRandomDeck,
  mdfcAsLand,
  setMdfcAsLand,
  targetLands,
  setTargetLands,
  basicsPercent,
  setBasicsPercent,
  preferColorLands,
  setPreferColorLands,
  avoidColorlessLands,
  setAvoidColorlessLands,
  onHover,
  onMouseLeave,
  generatingDeck = false,
  deckGenStatus = '',
}: CardSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Card[]>([]);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // FIX 1: handleSearch now accepts an optional query argument
  const handleSearch = useCallback(async (searchQuery?: string) => {
    const queryToUse = searchQuery || query;
    
    if (!commander || !queryToUse.trim()) return;
    
    setLoading(true);
    setStatus('Searching cards…');
    try {
      // Use the resolved query string for the search
      const res = await searchCards(queryToUse, commander.color_identity || []);
      setResults(res);
      setStatus(res.length ? `${res.length} result(s)` : 'No results.');
    } catch (error) {
      console.error('Error fetching cards:', error);
      setStatus('Error fetching cards. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [commander, query]); // Removed 'query' from dependencies since we handle it inside

  // FIX 1: handleQuickFilter now explicitly calls handleSearch with the new query
  const handleQuickFilter = useCallback(
    (filterKey: keyof typeof QUICK_FILTERS) => {
      const newQuery = QUICK_FILTERS[filterKey];
      setQuery(newQuery);
      // Pass the new query to handleSearch immediately
      void handleSearch(newQuery); 
    },
    [handleSearch]
  );

  const handleAdd = useCallback(
    (card: Card) => {
      if (deck.length >= 99) {
        alert('Deck is full (99 cards plus 1 commander).');
        return;
      }
      if (deck.some(d => d.id === card.id && !card.type_line?.toLowerCase().includes('basic land'))) {
        alert('Commander format allows only one copy.');
        return;
      }
      onAddCard(card);
    },
    [deck, onAddCard]
  );

  if (!commander) return null;

  return (
    <ErrorBoundary>
      <section style={{ marginTop: '1rem' }} role="search" aria-label="Card search">
        <h3>Card Search</h3>
      <div className="inline-controls">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          // Call handleSearch without an argument (it uses the state.query)
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
          placeholder="Search for cards (e.g., ramp, draw, removal)"
        />
        <button className="btn primary" onClick={() => handleSearch()} disabled={loading}>
          Search
        </button>
        <button className="btn" onClick={onGenerateRandomDeck} disabled={loading || generatingDeck}>
          {generatingDeck ? 'Generating...' : 'Random Deck'}
        </button>
        <span className="small muted" role="status">
          {deckGenStatus ? (
            <span className="loading" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
              {deckGenStatus}
            </span>
          ) : status ? (
            <span className={loading ? 'loading' : ''}>{status}</span>
          ) : null}
        </span>
      </div>
      <div className="small" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span className="muted">Quick filters:</span>
        {Object.keys(QUICK_FILTERS).map((key) => (
          <button key={key} className="btn" onClick={() => handleQuickFilter(key as keyof typeof QUICK_FILTERS)}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>
      <div className="small muted" style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <label>
          Target lands:{' '}
          <input
            type="number"
            min="32"
            max="60"
            value={targetLands}
            // FIX 2: Added validation check
            onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value)) {
                    setTargetLands(value);
                }
            }}
            style={{ width: '4rem' }}
          />
        </label>
        <label>
          Basics %:{' '}
          <input
            type="number"
            min="0"
            max="100"
            value={basicsPercent}
            // FIX 2: Added validation check
            onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value)) {
                    setBasicsPercent(value);
                }
            }}
            style={{ width: '4rem' }}
          />
        </label>
        <label>
          <input type="checkbox" checked={mdfcAsLand} onChange={(e) => setMdfcAsLand(e.target.checked)} /> Count MDFC
          land faces as lands
        </label>
        <label>
          <input type="checkbox" checked={preferColorLands} onChange={(e) => setPreferColorLands(e.target.checked)} />{' '}
          Prefer lands that produce commander colors
        </label>
        <label>
          <input
            type="checkbox"
            checked={avoidColorlessLands}
            onChange={(e) => setAvoidColorlessLands(e.target.checked)}
          />{' '}
          Avoid colorless-only utility lands
        </label>
      </div>
      <ul>
        {results.map((c) => {
          const isDuplicate = deck.some(d => d.id === c.id && !c.type_line?.toLowerCase().includes('basic land'));
          // Note: The logic for basic lands being duplicated is handled outside this component
          // The component currently only checks if the deck is full or if it's a non-basic land duplicate.
          const disabled = isDuplicate || deck.length >= 99; 
          return (
            <li
              key={c.id}
              onMouseMove={(e) => onHover?.(c, e)}
              onMouseLeave={onMouseLeave}
            >
              <span className="small">
                {cardName(c)} {manaCost(c) && `(${manaCost(c)})`} - <span className="muted">{c.type_line || ''}</span>
              </span>
              <button className="btn" onClick={() => handleAdd(c)} disabled={disabled}>
                Add
              </button>
            </li>
          );
        })}
      </ul>
    </section>
    </ErrorBoundary>
  );
}
