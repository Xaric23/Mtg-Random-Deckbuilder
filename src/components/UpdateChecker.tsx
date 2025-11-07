'use client';

import { useState, useEffect } from 'react';

export function UpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      const checkForUpdates = async () => {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg) {
            setRegistration(reg);
            
            // Force check for updates
            console.log('Checking for service worker updates...');
            await reg.update();

            // Check if there's already a waiting worker
            if (reg.waiting && navigator.serviceWorker.controller) {
              console.log('Update found - waiting service worker detected');
              setUpdateAvailable(true);
            }

            // Listen for new service worker installing
            const updateFoundHandler = () => {
              console.log('Update found event fired');
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  console.log('Service worker state changed:', newWorker.state);
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('New service worker installed, showing update prompt');
                    setUpdateAvailable(true);
                  }
                });
              }
            };

            reg.addEventListener('updatefound', updateFoundHandler);

            return () => {
              reg.removeEventListener('updatefound', updateFoundHandler);
            };
          }
        } catch (error) {
          console.error('Error checking for updates:', error);
        }
      };

      // Check immediately
      checkForUpdates();

      // Check every 2 minutes for updates
      const updateCheckInterval = setInterval(() => {
        console.log('Periodic update check...');
        checkForUpdates();
      }, 2 * 60 * 1000);

      // Listen for controller change (service worker updated and activated)
      const controllerChangeHandler = () => {
        console.log('Service worker controller changed, reloading page');
        window.location.reload();
      };
      
      navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);

      return () => {
        clearInterval(updateCheckInterval);
        navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
      };
    }
  }, []);

  const handleUpdate = () => {
    console.log('User clicked update');
    if (registration?.waiting) {
      console.log('Sending SKIP_WAITING message to service worker');
      // Tell the service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
      // The controllerchange event will trigger a reload
    } else {
      console.log('No waiting service worker found, reloading anyway');
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    console.log('User dismissed update notification');
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
        background: 'var(--card-bg, #fff)',
        border: '2px solid var(--btn-bd, #4a9eff)',
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        zIndex: 1001,
        maxWidth: '90%',
        textAlign: 'center',
      }}
      role="alert"
      aria-live="polite"
    >
      <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold', fontSize: '1.1rem' }}>
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

