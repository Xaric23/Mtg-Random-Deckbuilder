'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Card } from '@/lib/types';
import { cardName, manaCost, colorPills } from '@/lib/deck'; // You'll need to update colorPills
import { searchCommanders, getRandomCommander } from '@/lib/scryfall';

interface CommanderSearchProps {
  onSelect: (commander: Card) => void;
  onHover?: (card: Card | null, e: React.MouseEvent) => void;
  onMouseLeave?: () => void;
}

// Security Fix: Temporary Component to replace dangerouslySetInnerHTML
// BEST PRACTICE: Move this logic into a dedicated component in src/components/
function ColorPillsSafe({ identity }: { identity?: string[] }) {
  if (!identity || identity.length === 0) {
    return null; // Or render a colorless icon if applicable
  }
  
  // NOTE: You must ensure your CSS has classes like 'mana-icon w', 'mana-icon u', etc.
  return identity.map(color => (
    <span 
      key={color} 
      className={`mana-icon ${color.toLowerCase()}`}
      // If you want to display the letter (W, U, B, R, G) inside the span:
      // dangerouslySetInnerHTML={{ __html: color }} // This is ONLY safe if `color` is guaranteed to be W, U, B, R, or G.
    />
  ));
}

export function CommanderSearch({ onSelect, onHover, onMouseLeave }: CommanderSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Card[]>([]);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Multi-Color Fix: Change to a Set to manage multiple selections
  const [colorFilter, setColorFilter] = useState<Set<string>>(new Set());
  const [archetypeFilter, setArchetypeFilter] = useState<string>('');
  
  // Convert the Set of filters into the query string for use in handleSearch
  // Use ci<= syntax to filter for commanders whose color identity is a subset of selected colors
  const colorQueryString = useMemo(() => {
    if (colorFilter.size === 0) return '';
    // Extract color letters from 'ci:w' format and build 'ci<=wub' syntax
    const colors = Array.from(colorFilter)
      .map(filter => filter.replace('ci:', ''))
      .join('');
    return `ci<=${colors}`;
  }, [colorFilter]);

  // handleSearch needs to be defined once to be included in the useEffect dependency array
  const handleSearch = useCallback(async () => {
    // Stale Results Fix: Active clear when all fields are empty
    if (!query.trim() && !colorQueryString && !archetypeFilter) {
      setResults([]);
      setStatus('');
      return;
    }
    
    setLoading(true);
    setStatus('Searching commanders…');
    try {
      let searchQuery = query.trim();
      
      // Add color filter using the generated query string
      if (colorQueryString) {
        searchQuery = searchQuery ? `${searchQuery} ${colorQueryString}` : colorQueryString;
      }
      
      // Add archetype filter (Archetype logic unchanged)
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
  }, [query, colorQueryString, archetypeFilter]); // Added colorQueryString to dependencies

  // Auto-search when filters change (Stale Results Fix: Removed the internal 'if' check)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [colorFilter, archetypeFilter, handleSearch]); // Added handleSearch dependency

  // Multi-Color Fix: Now manages adding/removing to the Set
  const handleColorFilterChange = useCallback((filterCode: string) => {
    const newFilter = new Set(colorFilter); 

    if (filterCode === '') {
      // 'Any' button clears all
      setColorFilter(new Set());
    } else {
      if (newFilter.has(filterCode)) {
        // Toggle off
        newFilter.delete(filterCode);
      } else {
        // Toggle on
        newFilter.add(filterCode);
      }
      setColorFilter(newFilter);
    }
  }, [colorFilter]);

  const handleArchetypeFilterChange = useCallback((filter: string) => {
    setArchetypeFilter(filter);
  }, []);

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
          // Multi-Color Fix: 'Any' is active if the Set is empty
          className={`btn ${colorFilter.size === 0 ? 'primary' : ''}`}
          onClick={() => handleColorFilterChange('')}
        >
          Any
        </button>
        {/* Multi-Color Fix: Check if the specific code is in the Set */}
        <button
          className={`btn ${colorFilter.has('ci:w') ? 'primary' : ''}`}
          onClick={() => handleColorFilterChange('ci:w')}
        >
          W
        </button>
        <button
          className={`btn ${colorFilter.has('ci:u') ? 'primary' : ''}`}
          onClick={() => handleColorFilterChange('ci:u')}
        >
          U
        </button>
        <button
          className={`btn ${colorFilter.has('ci:b') ? 'primary' : ''}`}
          onClick={() => handleColorFilterChange('ci:b')}
        >
          B
        </button>
        <button
          className={`btn ${colorFilter.has('ci:r') ? 'primary' : ''}`}
          onClick={() => handleColorFilterChange('ci:r')}
        >
          R
        </button>
        <button
          className={`btn ${colorFilter.has('ci:g') ? 'primary' : ''}`}
          onClick={() => handleColorFilterChange('ci:g')}
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
              {/* Security Fix: Using safe component instead of dangerouslySetInnerHTML */}
              <ColorPillsSafe identity={c.color_identity} /> 
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
