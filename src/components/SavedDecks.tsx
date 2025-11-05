'use client';

import { useState, useEffect } from 'react';
import { getSavedDecks, setSavedDecks } from '@/lib/storage';
import type { SavedDeck } from '@/lib/types';

interface SavedDecksProps {
  onLoad: (deck: SavedDeck) => void;
}

export function SavedDecks({ onLoad }: SavedDecksProps) {
  const [decks, setDecks] = useState<Record<string, SavedDeck>>({});

  useEffect(() => {
    setDecks(getSavedDecks());
  }, []);

  const handleDelete = (name: string) => {
    if (!confirm(`Delete deck "${name}"?`)) return;
    const updated = { ...decks };
    delete updated[name];
    setSavedDecks(updated);
    setDecks(updated);
  };

  const handleLoad = (name: string) => {
    const deck = decks[name];
    if (deck) {
      onLoad(deck);
      alert(`Loaded deck: ${name}`);
    }
  };

  return (
    <>
      <h3>Saved Decks</h3>
      <ul>
        {Object.keys(decks)
          .sort()
          .map((name) => (
            <li key={name}>
              <span>{name}</span>{' '}
              <button className="btn" onClick={() => handleLoad(name)}>
                Load
              </button>{' '}
              <button className="btn danger" onClick={() => handleDelete(name)}>
                Delete
              </button>
            </li>
          ))}
      </ul>
    </>
  );
}

