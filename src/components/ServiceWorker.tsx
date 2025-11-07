'use client';

import { useEffect } from 'react';

export function ServiceWorker() {
  useEffect(() => {
    // Variable to hold the interval ID so we can clear it later.
    let updateIntervalId: number | undefined;

    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      const registerSW = () => {
        // Path logic is good for GitHub Pages deployment
        const swPath = window.location.pathname.startsWith('/Mtg-Random-Deckbuilder')
          ? '/Mtg-Random-Deckbuilder/sw.js'
          : '/sw.js';

        navigator.serviceWorker
          .register(swPath, { updateViaCache: 'none' })
          .then((registration) => {
            console.log('SW registered: ', registration);

            // Check for updates immediately
            void registration.update();

            // Set up recurring update check (every hour)
            updateIntervalId = window.setInterval(() => {
              void registration.update();
              console.log('SW update check triggered.');
            }, 60 * 60 * 1000); // 1 hour
          })
          .catch((registrationError) => {
            console.error('SW registration failed: ', registrationError);
          });
      };
      
      // Removed the document.readyState logic and the load listener.
      // Register immediately when the component mounts.
      registerSW();
    }
    
    // CRITICAL FIX: Return the cleanup function directly from useEffect
    return () => {
      if (updateIntervalId !== undefined) {
        clearInterval(updateIntervalId);
      }
    };
  }, []);

  return null;
}
