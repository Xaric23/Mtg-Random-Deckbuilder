'use client';

import { useState, useRef } from 'react';
import type { Card } from '@/lib/types';
import { importDeckFromText } from '@/lib/import';

interface ImportDeckProps {
  onImport: (commander: Card | null, deck: Card[], maybeboard: Card[]) => void;
}

export function ImportDeck({ onImport }: ImportDeckProps) {
  const [text, setText] = useState('');
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImport = async () => {
    if (!text.trim()) {
      setStatus('Please paste a decklist first.');
      return;
    }

    setImporting(true);
    setStatus('Importing deck...');

    try {
      const result = await importDeckFromText(text, (progress) => {
        setStatus(progress);
      });

      if (result.deck.length === 0 && !result.commander) {
        setStatus('Import failed: No cards found. Please check the decklist format.');
        setTimeout(() => setStatus(''), 5000);
        return;
      }
      
      setStatus(`Imported ${result.deck.length} cards${result.maybeboard.length > 0 ? ` and ${result.maybeboard.length} maybeboard cards` : ''}${result.commander ? ` with commander ${result.commander.name}` : ''}.`);
      onImport(result.commander, result.deck, result.maybeboard);
      setText('');
      setTimeout(() => setStatus(''), 5000);
    } catch (error) {
      console.error('Import error:', error);
      setStatus('Error importing deck. Please check the format.');
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setImporting(false);
    }
  };

  const handlePaste = () => {
    textareaRef.current?.focus();
    navigator.clipboard.readText().then((clipText) => {
      setText(clipText);
    }).catch(() => {
      // Fallback - user can manually paste
    });
  };

  return (
    <section style={{ marginTop: '1rem' }}>
      <h3>Import Deck</h3>
      <div className="small muted" style={{ marginBottom: '0.5rem' }}>
        Paste a decklist from Moxfield, Archidekt, or any text format. Supports commanders, main deck, and maybeboard sections.
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste decklist here (Moxfield, Archidekt, or text format)..."
        rows={10}
        style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.9rem' }}
        disabled={importing}
        aria-label="Deck list input"
        aria-describedby="deck-format-help"
      />
      <div className="inline-controls" style={{ marginTop: '0.5rem' }}>
        <button className="btn primary" onClick={handleImport} disabled={importing || !text.trim()}>
          {importing ? 'Importing...' : 'Import Deck'}
        </button>
        <button className="btn" onClick={handlePaste} disabled={importing}>
          Paste from Clipboard
        </button>
        {status && (
          <span className="small muted" style={{ color: 'var(--primary)' }}>
            {status}
          </span>
        )}
      </div>
      <div className="small muted" style={{ marginTop: '0.5rem' }}>
        Format examples:
        <br />
        • Moxfield: &quot;Commander\n1 Name\n\n1 Card Name...&quot;
        <br />
        • Archidekt: &quot;// Commander\n1 Name\n\n// Deck\n1 Card Name...&quot;
        <br />
        • Standard: &quot;Commander\n1 Name\n\nNonlands\n1 Card...\n\nLands\n1 Card...&quot;
      </div>
    </section>
  );
}

