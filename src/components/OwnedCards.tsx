'use client';

import { useState, useCallback, useRef } from 'react';
import { getOwnedCards, setOwnedCards, addOwnedCard, removeOwnedCard } from '@/lib/storage';
import { fetchNamedCard } from '@/lib/scryfall';
import { cardName } from '@/lib/deck';
import type { Card } from '@/lib/types';

interface OwnedCardsProps {
  onOwnedCardsChange?: () => void;
}

export function OwnedCards({ onOwnedCardsChange }: OwnedCardsProps) {
  const [ownedSet, setOwnedSet] = useState<Set<string>>(getOwnedCards());
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshOwned = useCallback(() => {
    const owned = getOwnedCards();
    setOwnedSet(owned);
    onOwnedCardsChange?.();
  }, [onOwnedCardsChange]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setStatus('Processing file...');

    try {
      const text = await file.text();
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      const cardNames: string[] = [];
      
      // Parse different formats: "1 Card Name", "Card Name", "// Comment", etc.
      for (const line of lines) {
        if (line.startsWith('//') || line.startsWith('#') || !line) continue;
        // Remove quantity prefix like "1 " or "2x "
        const match = line.match(/^\d+\s*(?:x\s*)?(.+)$/i);
        const cardName = match ? match[1].trim() : line.trim();
        if (cardName) cardNames.push(cardName);
      }

      setStatus(`Found ${cardNames.length} card names. Looking up cards...`);
      
      // Fetch cards and add to owned set
      const owned = new Set(ownedSet);
      let added = 0;
      let failed = 0;

      for (let i = 0; i < cardNames.length; i++) {
        const name = cardNames[i];
        try {
          const card = await fetchNamedCard(name);
          if (card) {
            owned.add(card.id);
            added++;
            if (added % 10 === 0) {
              setStatus(`Added ${added}/${cardNames.length} cards...`);
            }
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
        // Rate limit
        if (i % 10 === 0 && i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setOwnedCards(owned);
      refreshOwned();
      setStatus(`Successfully added ${added} cards. ${failed} cards not found.`);
      setTimeout(() => setStatus(''), 5000);
    } catch (error) {
      console.error('Error processing file:', error);
      setStatus('Error processing file. Please check the format.');
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [ownedSet, refreshOwned]);

  const handleToggleOwned = useCallback((cardId: string) => {
    if (ownedSet.has(cardId)) {
      removeOwnedCard(cardId);
    } else {
      addOwnedCard(cardId);
    }
    refreshOwned();
  }, [ownedSet, refreshOwned]);

  const handleClearAll = useCallback(() => {
    if (confirm('Clear all owned cards?')) {
      setOwnedCards([]);
      refreshOwned();
    }
  }, [refreshOwned]);

  const ownedCount = ownedSet.size;

  return (
    <section style={{ marginTop: '1rem' }}>
      <h3>Owned Cards ({ownedCount})</h3>
      <div className="small muted" style={{ marginBottom: '0.5rem' }}>
        Upload a text file (TXT/CSV) with card names to mark cards as owned. Cards will be highlighted in your decklist.
      </div>
      <div className="inline-controls" style={{ marginBottom: '0.5rem' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv,.text"
          onChange={handleFileUpload}
          disabled={processing}
          style={{ display: 'none' }}
        />
        <button
          className="btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={processing}
        >
          {processing ? 'Processing...' : 'Upload Card List'}
        </button>
        {ownedCount > 0 && (
          <button className="btn" onClick={handleClearAll}>
            Clear All
          </button>
        )}
        {status && (
          <span className="small muted" style={{ color: 'var(--primary)' }}>
            {status}
          </span>
        )}
      </div>
      <div className="small muted">
        Format: One card name per line (e.g., &quot;1 Lightning Bolt&quot; or &quot;Lightning Bolt&quot;). 
        Lines starting with // or # are ignored.
      </div>
    </section>
  );
}

