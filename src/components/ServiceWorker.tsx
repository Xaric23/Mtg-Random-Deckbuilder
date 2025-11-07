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
          .register(swPath, { 
            updateViaCache: 'none',  // Don't cache the service worker file
            scope: window.location.pathname.startsWith('/Mtg-Random-Deckbuilder')
              ? '/Mtg-Random-Deckbuilder/'
              : '/'
          })
          .then((registration) => {
            console.log('SW registered: ', registration);
            console.log('SW scope: ', registration.scope);

            // Check for updates immediately
            void registration.update();

            // Set up recurring update check (every 30 minutes)
            updateIntervalId = window.setInterval(() => {
              console.log('SW periodic update check triggered.');
              void registration.update();
            }, 30 * 60 * 1000); // 30 minutes (more frequent)

            // Handle updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              console.log('Update found! New service worker installing.');
              
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  console.log('New SW state:', newWorker.state);
                });
              }
            });
          })
          .catch((registrationError) => {
            console.error('SW registration failed: ', registrationError);
          });
      };
      
      // Register immediately when the component mounts
      registerSW();
    }
    
    // Return the cleanup function directly from useEffect
    return () => {
      if (updateIntervalId !== undefined) {
        clearInterval(updateIntervalId);
      }
    };
  }, []);

  return null;
}
