'use client';

import { useEffect } from 'react';

export function ServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      const registerSW = () => {
        const swPath = window.location.pathname.startsWith('/Mtg-Random-Deckbuilder') 
          ? '/Mtg-Random-Deckbuilder/sw.js'
          : '/sw.js';
        navigator.serviceWorker
          .register(swPath, { updateViaCache: 'none' })
          .then((registration) => {
            console.log('SW registered: ', registration);
            
            // Check for updates immediately
            void registration.update();
            
            // Check for updates every hour
            const updateInterval = setInterval(() => {
              void registration.update();
            }, 60 * 60 * 1000);

            // Cleanup interval on unmount
            return () => clearInterval(updateInterval);
          })
          .catch((registrationError) => {
            console.error('SW registration failed: ', registrationError);
          });
      };

      // Register immediately if page is already loaded
      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
    }
  }, []);

  return null;
}

