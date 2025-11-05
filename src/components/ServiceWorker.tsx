'use client';

import { useEffect } from 'react';

export function ServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      const registerSW = () => {
        navigator.serviceWorker
          .register('/sw.js', { updateViaCache: 'none' })
          .then((registration) => {
            console.log('SW registered: ', registration);
            
            // Check for updates immediately
            registration.update();
            
            // Check for updates every hour
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
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

