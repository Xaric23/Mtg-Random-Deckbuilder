'use client';

import type { Card } from '@/lib/types';
import { cardName, manaCost } from '@/lib/deck';

interface MaybeboardProps {
  maybeboard: Card[];
  onAddToDeck: (card: Card) => void;
  onRemove: (cardId: string) => void;
  onHover?: (card: Card | null, e: React.MouseEvent) => void;
  onMouseLeave?: () => void;
}

export function Maybeboard({
  maybeboard,
  onAddToDeck,
  onRemove,
  onHover,
  onMouseLeave,
}: MaybeboardProps) {
  if (maybeboard.length === 0) return null;

  return (
    <section style={{ marginTop: '1rem' }}>
      <h3>Maybeboard ({maybeboard.length})</h3>
      <div className="small muted" style={{ marginBottom: '0.5rem' }}>
        Cards considered but not in the main deck. Click "Add to Deck" to move them to your deck.
      </div>
      <ul>
        {maybeboard.map((c) => {
          const legal = c?.legalities?.commander === 'legal' ? <span className="badge">EDH</span> : null;
          const tag = c._tag ? <span className="badge">{c._tag}</span> : null;
          return (
            <li
              key={c.id}
              onMouseMove={(e) => onHover?.(c, e)}
              onMouseLeave={onMouseLeave}
            >
              <span className="small">
                {cardName(c)} {manaCost(c) && `(${manaCost(c)})`} - <span className="muted">{c.type_line || ''}</span>{' '}
                {legal} {tag}
              </span>
              <span style={{ flex: '1 1 auto' }}></span>
              <div className="inline-controls">
                <button className="btn" onClick={() => onAddToDeck(c)}>
                  Add to Deck
                </button>
                <button className="btn" onClick={() => onRemove(c.id)}>
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

