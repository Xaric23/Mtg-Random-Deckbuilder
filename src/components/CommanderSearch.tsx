'use client';

import { useState, useCallback } from 'react';
import type { Card } from '@/lib/types';
import { cardName, manaCost, colorPills } from '@/lib/deck';
import { searchCommanders, getRandomCommander } from '@/lib/scryfall';

interface CommanderSearchProps {
  onSelect: (commander: Card) => void;
  onHover?: (card: Card | null, e: React.MouseEvent) => void;
  onMouseLeave?: () => void;
}

export function CommanderSearch({ onSelect, onHover, onMouseLeave }: CommanderSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Card[]>([]);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setStatus('Searching commanders…');
    try {
      const res = await searchCommanders(query);
      setResults(res);
      setStatus(res.length ? `${res.length} result(s)` : 'No results.');
    } catch {
      setStatus('Error fetching commanders.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleRandom = useCallback(async () => {
    setLoading(true);
    setStatus('Picking a random commander…');
    try {
      const commander = await getRandomCommander();
      if (commander) {
        onSelect(commander);
        setResults([]);
        setStatus(`${cardName(commander)} selected`);
      } else {
        setStatus('Error picking random commander.');
      }
    } catch {
      setStatus('Error picking random commander.');
    } finally {
      setLoading(false);
    }
  }, [onSelect]);

  const handlePick = useCallback(
    async (cardId: string) => {
      const card = results.find(c => c.id === cardId);
      if (card) {
        onSelect(card);
        setResults([]);
      }
    },
    [results, onSelect]
  );

  return (
    <section className="col">
      <h2>Select Commander</h2>
      <div className="inline-controls">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for commander (e.g., Atraxa)"
        />
        <button className="btn primary" onClick={handleSearch} disabled={loading}>
          Search
        </button>
        <button className="btn" onClick={handleRandom} disabled={loading}>
          Random Commander
        </button>
      </div>
      <div className="small muted" role="status">
        {status && <span className={loading ? 'loading' : ''}>{status}</span>}
      </div>
      <ul>
        {results.map((c) => (
          <li
            key={c.id}
            onMouseMove={(e) => onHover?.(c, e)}
            onMouseLeave={onMouseLeave}
          >
            <span className="small">
              {cardName(c)} {manaCost(c) && `(${manaCost(c)})`} - <span className="muted">{c.type_line || ''}</span>{' '}
              <span dangerouslySetInnerHTML={{ __html: colorPills(c.color_identity) }} />
            </span>
            <button className="btn" onClick={() => handlePick(c.id)}>
              Pick
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

