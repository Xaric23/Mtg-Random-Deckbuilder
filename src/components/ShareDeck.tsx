'use client';

import { useState } from 'react';
import type { Card } from '@/lib/types';
import { cardName } from '@/lib/deck';

interface ShareDeckProps {
  commander: Card | null;
  deck: Card[];
}

export function ShareDeck({ commander, deck }: ShareDeckProps) {
  const [showModal, setShowModal] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string>('');

  const generateShareableText = () => {
    let text = '# MTG Commander Deck\n\n';
    
    if (commander) {
      text += `## Commander\n1 ${cardName(commander)}\n\n`;
    }
    
    text += `## Deck (${deck.length} cards)\n`;
    deck.forEach(card => {
      const tag = card._tag ? ` [${card._tag}]` : '';
      text += `1 ${cardName(card)}${tag}\n`;
    });
    
    return text;
  };

  const generateShareableURL = () => {
    const data = {
      c: commander?.id || null,
      d: deck.map(card => card.id),
    };
    
    const encoded = btoa(JSON.stringify(data));
    const url = `${window.location.origin}?deck=${encoded}`;
    
    return url.length < 8000 ? url : null; // URL too long
  };

  const handleCopyText = async () => {
    const text = generateShareableText();
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('✓ Copied to clipboard!');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch {
      setCopyStatus('✗ Failed to copy');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  const handleCopyURL = async () => {
    const url = generateShareableURL();
    if (!url) {
      setCopyStatus('✗ Deck too large for URL');
      setTimeout(() => setCopyStatus(''), 2000);
      return;
    }
    
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus('✓ Link copied!');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch {
      setCopyStatus('✗ Failed to copy link');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  const handleTwitterShare = () => {
    const text = commander 
      ? `Check out my ${cardName(commander)} Commander deck! 🎴`
      : 'Check out my Commander deck! 🎴';
    
    const url = generateShareableURL();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}${url ? `&url=${encodeURIComponent(url)}` : ''}`;
    
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  if (deck.length === 0) {
    return null;
  }

  return (
    <>
      <button
        className="btn"
        onClick={() => setShowModal(true)}
        title="Share deck"
      >
        🔗 Share
      </button>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-primary, #fff)',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>🔗 Share Deck</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  lineHeight: 1,
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h3 className="small" style={{ marginBottom: '0.5rem' }}>Copy as Text</h3>
                <button
                  className="btn primary"
                  onClick={handleCopyText}
                  style={{ width: '100%' }}
                >
                  📋 Copy Decklist
                </button>
                <p className="small muted" style={{ marginTop: '0.25rem' }}>
                  Copies the decklist as formatted text
                </p>
              </div>

              <div>
                <h3 className="small" style={{ marginBottom: '0.5rem' }}>Share Link</h3>
                <button
                  className="btn primary"
                  onClick={handleCopyURL}
                  style={{ width: '100%' }}
                >
                  🔗 Copy Shareable Link
                </button>
                <p className="small muted" style={{ marginTop: '0.25rem' }}>
                  Creates a link others can use to load your deck
                </p>
              </div>

              <div>
                <h3 className="small" style={{ marginBottom: '0.5rem' }}>Social Media</h3>
                <button
                  className="btn"
                  onClick={handleTwitterShare}
                  style={{ width: '100%' }}
                >
                  🐦 Share on Twitter
                </button>
              </div>

              {copyStatus && (
                <div
                  style={{
                    padding: '0.75rem',
                    background: copyStatus.includes('✓') ? '#d4edda' : '#f8d7da',
                    color: copyStatus.includes('✓') ? '#155724' : '#721c24',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {copyStatus}
                </div>
              )}

              <div className="small muted" style={{ padding: '1rem', background: 'var(--bg-secondary, #f5f5f5)', borderRadius: '6px' }}>
                <strong>Note:</strong> Shareable links encode your entire deck in the URL. Very large decks may not work with this method.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
