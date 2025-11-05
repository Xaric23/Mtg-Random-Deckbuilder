'use client';

import { useState, useCallback, useEffect } from 'react';
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
  const [colorFilter, setColorFilter] = useState<string>('');
  const [archetypeFilter, setArchetypeFilter] = useState<string>('');

  // Auto-search when filters change
  useEffect(() => {
    if (colorFilter || archetypeFilter) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorFilter, archetypeFilter]);

  const handleColorFilterChange = useCallback((filter: string) => {
    setColorFilter(filter);
  }, []);

  const handleArchetypeFilterChange = useCallback((filter: string) => {
    setArchetypeFilter(filter);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim() && !colorFilter && !archetypeFilter) return;
    setLoading(true);
    setStatus('Searching commanders…');
    try {
      let searchQuery = query.trim();
      
      // Add color filter
      if (colorFilter) {
        searchQuery = searchQuery ? `${searchQuery} ${colorFilter}` : colorFilter;
      }
      
      // Add archetype filter
      if (archetypeFilter) {
        const archetypeQueries: Record<string, string> = {
          aggro: 'o:haste or o:trample or o:"+1/+1"',
          stax: 'o:"each opponent" or o:"cannot" or o:"tap"',
          combo: 'o:"whenever" or o:"search your library"',
          tribal: 'o:"creature" or o:"creatures"',
          voltron: 'o:"equipped" or o:"enchanted"',
          control: 'o:"counter target" or o:"destroy target"',
        };
        const archetypeQuery = archetypeQueries[archetypeFilter] || '';
        if (archetypeQuery) {
          searchQuery = searchQuery ? `${searchQuery} ${archetypeQuery}` : archetypeQuery;
        }
      }
      
      const res = await searchCommanders(searchQuery || '*');
      setResults(res);
      setStatus(res.length ? `${res.length} result(s)` : 'No results.');
    } catch {
      setStatus('Error fetching commanders.');
    } finally {
      setLoading(false);
    }
  }, [query, colorFilter, archetypeFilter]);

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
      <div className="small" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span className="muted">Color:</span>
        <button
          className={`btn ${colorFilter === '' ? 'primary' : ''}`}
          onClick={() => handleColorFilterChange('')}
        >
          Any
        </button>
        <button
          className={`btn ${colorFilter === 'ci:w' ? 'primary' : ''}`}
          onClick={() => handleColorFilterChange(colorFilter === 'ci:w' ? '' : 'ci:w')}
        >
          W
        </button>
        <button
          className={`btn ${colorFilter === 'ci:u' ? 'primary' : ''}`}
          onClick={() => handleColorFilterChange(colorFilter === 'ci:u' ? '' : 'ci:u')}
        >
          U
        </button>
        <button
          className={`btn ${colorFilter === 'ci:b' ? 'primary' : ''}`}
          onClick={() => handleColorFilterChange(colorFilter === 'ci:b' ? '' : 'ci:b')}
        >
          B
        </button>
        <button
          className={`btn ${colorFilter === 'ci:r' ? 'primary' : ''}`}
          onClick={() => handleColorFilterChange(colorFilter === 'ci:r' ? '' : 'ci:r')}
        >
          R
        </button>
        <button
          className={`btn ${colorFilter === 'ci:g' ? 'primary' : ''}`}
          onClick={() => handleColorFilterChange(colorFilter === 'ci:g' ? '' : 'ci:g')}
        >
          G
        </button>
      </div>
      <div className="small" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span className="muted">Archetype:</span>
        <button
          className={`btn ${archetypeFilter === '' ? 'primary' : ''}`}
          onClick={() => handleArchetypeFilterChange('')}
        >
          Any
        </button>
        <button
          className={`btn ${archetypeFilter === 'aggro' ? 'primary' : ''}`}
          onClick={() => handleArchetypeFilterChange(archetypeFilter === 'aggro' ? '' : 'aggro')}
        >
          Aggro
        </button>
        <button
          className={`btn ${archetypeFilter === 'stax' ? 'primary' : ''}`}
          onClick={() => handleArchetypeFilterChange(archetypeFilter === 'stax' ? '' : 'stax')}
        >
          Stax
        </button>
        <button
          className={`btn ${archetypeFilter === 'combo' ? 'primary' : ''}`}
          onClick={() => handleArchetypeFilterChange(archetypeFilter === 'combo' ? '' : 'combo')}
        >
          Combo
        </button>
        <button
          className={`btn ${archetypeFilter === 'tribal' ? 'primary' : ''}`}
          onClick={() => handleArchetypeFilterChange(archetypeFilter === 'tribal' ? '' : 'tribal')}
        >
          Tribal
        </button>
        <button
          className={`btn ${archetypeFilter === 'voltron' ? 'primary' : ''}`}
          onClick={() => handleArchetypeFilterChange(archetypeFilter === 'voltron' ? '' : 'voltron')}
        >
          Voltron
        </button>
        <button
          className={`btn ${archetypeFilter === 'control' ? 'primary' : ''}`}
          onClick={() => handleArchetypeFilterChange(archetypeFilter === 'control' ? '' : 'control')}
        >
          Control
        </button>
      </div>
      <div className="small muted" role="status" style={{ marginTop: '0.5rem' }}>
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

