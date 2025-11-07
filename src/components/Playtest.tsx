'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Card } from '@/lib/types';
import { cardName, manaCost, manaValue } from '@/lib/deck';

interface PlaytestProps {
  commander: Card | null;
  deck: Card[];
  onShuffle: () => void;
}

export function Playtest({ commander, deck, onShuffle }: PlaytestProps) {
  const [hand, setHand] = useState<Card[]>([]);
  const [library, setLibrary] = useState<Card[]>([]);
  const [graveyard, setGraveyard] = useState<Card[]>([]);
  const [drawn, setDrawn] = useState(0);
  const [currentDeck, setCurrentDeck] = useState(deck);
  const statusTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Check if deck has changed and reset if needed
  if (deck !== currentDeck) {
    setCurrentDeck(deck);
    setHand([]);
    setLibrary([]);
    setGraveyard([]);
    setDrawn(0);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  const shuffleLibrary = useCallback(() => {
    if (deck.length === 0) return;
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setLibrary(shuffled);
    setHand([]);
    setGraveyard([]);
    setDrawn(0);
    onShuffle();
  }, [deck, onShuffle]);

  const drawCard = useCallback(() => {
    if (library.length === 0) {
      alert('Library is empty!');
      return;
    }
    const card = library[0];
    setLibrary(prev => prev.slice(1));
    setHand(prev => [...prev, card]);
    setDrawn(prev => prev + 1);
  }, [library]);

  const drawHand = useCallback((count: number = 7) => {
    if (library.length < count) {
      alert(`Not enough cards in library! (${library.length} remaining)`);
      return;
    }
    const drawnCards = library.slice(0, count);
    setLibrary(prev => prev.slice(count));
    setHand(prev => [...prev, ...drawnCards]);
    setDrawn(prev => prev + count);
  }, [library]);

  const mulligan = useCallback(() => {
    if (hand.length === 0) return;
    setLibrary(prev => [...prev, ...hand]);
    setHand([]);
    setDrawn(0);
    // Shuffle after adding cards back
    setTimeout(() => {
      setLibrary(prev => [...prev].sort(() => Math.random() - 0.5));
    }, 0);
  }, [hand]);

  const discard = useCallback((cardId: string) => {
    const card = hand.find(c => c.id === cardId);
    if (!card) return;
    setHand(prev => prev.filter(c => c.id !== cardId));
    setGraveyard(prev => [...prev, card]);
  }, [hand]);

  const reset = useCallback(() => {
    setHand([]);
    setLibrary([]);
    setGraveyard([]);
    setDrawn(0);
  }, []);

  // Analyze hand
  const handAnalysis = {
    totalManaValue: hand.reduce((sum, c) => sum + manaValue(c), 0),
    averageManaValue: hand.length > 0 ? hand.reduce((sum, c) => sum + manaValue(c), 0) / hand.length : 0,
    lands: hand.filter(c => c.type_line?.toLowerCase().includes('land')).length,
    ramp: hand.filter(c => c._tag === 'Ramp').length,
    draw: hand.filter(c => c._tag === 'Draw').length,
    removal: hand.filter(c => c._tag === 'Removal').length,
  };

  const isPlayable = handAnalysis.lands >= 2 || handAnalysis.ramp >= 1;
  const isGoodHand = isPlayable && handAnalysis.averageManaValue <= 3 && handAnalysis.lands >= 3;

  return (
    <section style={{ marginTop: '1rem' }}>
      <h3>Playtest Mode</h3>
      <div className="small muted" style={{ marginBottom: '0.5rem' }}>
        Simulate shuffles, opening hands, and draws. Test your deck&apos;s consistency.
      </div>
      
      <div className="inline-controls" style={{ marginBottom: '1rem' }}>
        <button className="btn primary" onClick={shuffleLibrary} disabled={deck.length === 0}>
          Shuffle Library
        </button>
        <button className="btn" onClick={() => drawHand(7)} disabled={library.length < 7}>
          Draw Opening Hand (7)
        </button>
        <button className="btn" onClick={() => drawCard()} disabled={library.length === 0}>
          Draw Card
        </button>
        <button className="btn" onClick={mulligan} disabled={hand.length === 0}>
          Mulligan
        </button>
        <button className="btn" onClick={reset}>
          Reset
        </button>
      </div>

      <div className="small" style={{ marginBottom: '1rem' }}>
        <span>Library: {library.length} cards</span>
        {' • '}
        <span>Hand: {hand.length} cards</span>
        {' • '}
        <span>Graveyard: {graveyard.length} cards</span>
        {' • '}
        <span>Drawn: {drawn} cards</span>
      </div>

      {hand.length > 0 && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--chip)', borderRadius: '8px' }}>
          <h4 className="small" style={{ marginBottom: '0.5rem' }}>Hand Analysis</h4>
          <div className="small" style={{ marginBottom: '0.5rem' }}>
            <span className={isGoodHand ? 'badge' : ''} style={isGoodHand ? { background: '#d4edda', color: '#155724' } : {}}>
              {isGoodHand ? '✓ Good Hand' : isPlayable ? '~ Playable' : '✗ Poor Hand'}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
            <div className="small">Lands: {handAnalysis.lands}</div>
            <div className="small">Ramp: {handAnalysis.ramp}</div>
            <div className="small">Draw: {handAnalysis.draw}</div>
            <div className="small">Removal: {handAnalysis.removal}</div>
            <div className="small">Avg MV: {handAnalysis.averageManaValue.toFixed(1)}</div>
            <div className="small">Total MV: {handAnalysis.totalManaValue}</div>
          </div>
        </div>
      )}

      {hand.length > 0 && (
        <div>
          <h4 className="small" style={{ marginBottom: '0.5rem' }}>Hand ({hand.length} cards)</h4>
          <ul>
            {hand.map((c) => (
              <li key={c.id}>
                <span className="small">
                  {cardName(c)} {manaCost(c) && `(${manaCost(c)})`} - <span className="muted">{c.type_line || ''}</span>
                </span>
                <button className="btn" onClick={() => discard(c.id)} style={{ marginLeft: 'auto' }}>
                  Discard
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

