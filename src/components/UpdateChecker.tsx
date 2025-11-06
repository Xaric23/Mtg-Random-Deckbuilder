'use client';

import { useState, useEffect } from 'react';

export function UpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      // Check for updates on load and periodically
      const checkForUpdates = async () => {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg) {
            setRegistration(reg);
            await reg.update();

            const updateFoundHandler = () => {
              const newWorker = reg.installing;
              if (newWorker) {
                const stateChangeHandler = () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    setUpdateAvailable(true);
                  }
                };
                newWorker.addEventListener('statechange', stateChangeHandler);
                return () => newWorker.removeEventListener('statechange', stateChangeHandler);
              }
            };

            reg.addEventListener('updatefound', updateFoundHandler);
            return () => reg.removeEventListener('updatefound', updateFoundHandler);
          }
        } catch (error) {
          console.error('Error checking for updates:', error);
        }
      };

      // Check immediately
      checkForUpdates();

      // Check periodically (every 5 minutes)
      const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

      // Listen for controller change (service worker updated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      return () => clearInterval(interval);
    }
  }, []);

  const handleUpdate = async () => {
    if (registration?.waiting) {
      // Tell the service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
      // The controllerchange event will trigger a reload
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  if (!updateAvailable) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--card-bg)',
        border: '1px solid var(--btn-bd)',
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        zIndex: 1001,
        maxWidth: '90%',
        textAlign: 'center',
      }}
    >
      <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold' }}>
        🎉 New version available!
      </p>
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
        A new version of the app is available. Update now to get the latest features and improvements.
      </p>
      <div className="inline-controls">
        <button className="btn primary" onClick={handleUpdate}>
          Update Now
        </button>
        <button className="btn" onClick={handleDismiss}>
          Later
        </button>
      </div>
    </div>
  );
}

