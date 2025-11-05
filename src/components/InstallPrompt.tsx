'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--card-bg)',
        border: '1px solid var(--btn-bd)',
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        zIndex: 1000,
        maxWidth: '90%',
        textAlign: 'center',
      }}
    >
      <p style={{ margin: '0 0 1rem 0' }}>Install this app for a better experience!</p>
      <div className="inline-controls">
        <button className="btn primary" onClick={handleInstall}>
          Install
        </button>
        <button className="btn" onClick={handleDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

