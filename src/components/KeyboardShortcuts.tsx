'use client';

import { useState, useEffect } from 'react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', description: 'Focus commander search' },
    { key: 'F', description: 'Focus card search' },
    { key: 'R', description: 'Generate random deck' },
    { key: 'Q', description: 'Pick random commander' },
    { key: 'E', description: 'Export deck' },
    { key: 'S', description: 'Save deck' },
    { key: 'D', description: 'Toggle dark mode' },
    { key: 'X', description: 'Clear deck' },
    { key: '?', description: 'Show this help' },
    { key: 'Esc', description: 'Close modals' },
  ];

  return (
    <>
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
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div
          style={{
            background: 'var(--bg-primary, #fff)',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 id="shortcuts-title" style={{ margin: 0 }}>⌨️ Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {shortcuts.map(({ key, description }) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'var(--bg-secondary, #f5f5f5)',
                  borderRadius: '6px',
                }}
              >
                <span>{description}</span>
                <kbd
                  style={{
                    padding: '0.25rem 0.75rem',
                    background: 'var(--bg-primary, #fff)',
                    border: '1px solid var(--border-color, #ddd)',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {key}
                </kbd>
              </div>
            ))}
          </div>
          
          <div className="small muted" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            Press <kbd style={{ padding: '0.125rem 0.5rem', background: 'var(--bg-secondary, #f5f5f5)', borderRadius: '4px' }}>?</kbd> anytime to show shortcuts
          </div>
        </div>
      </div>
    </>
  );
}
