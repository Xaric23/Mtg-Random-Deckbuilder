import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorker } from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: "MTG Commander Deck Builder",
  description: "Build and manage your Magic: The Gathering Commander decks",
  manifest: process.env.NODE_ENV === 'production' ? '/Mtg-Random-Deckbuilder/manifest.json' : '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Deck Builder",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: process.env.NODE_ENV === 'production' ? '/Mtg-Random-Deckbuilder/icon-192.png' : '/icon-192.png', sizes: "192x192", type: "image/png" },
      { url: process.env.NODE_ENV === 'production' ? '/Mtg-Random-Deckbuilder/icon-512.png' : '/icon-512.png', sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: process.env.NODE_ENV === 'production' ? '/Mtg-Random-Deckbuilder/icon-192.png' : '/icon-192.png', sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1976d2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function initDarkMode() {
                  try {
                    const darkMode = localStorage.getItem('edh_dark_mode');
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    const html = document.documentElement;
                    const body = document.body;
                    
                    if (!html || !body) return;
                    
                    if (darkMode === '1' || (darkMode === null && prefersDark)) {
                      html.classList.add('dark');
                      body.classList.add('dark');
                    }
                    
                    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                      if (localStorage.getItem('edh_dark_mode') === null) {
                        if (e.matches) {
                          html.classList.add('dark');
                          body.classList.add('dark');
                        } else {
                          html.classList.remove('dark');
                          body.classList.remove('dark');
                        }
                      }
                    });
                  } catch (e) {
                    console.warn('Dark mode initialization error:', e);
                  }
                }

                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', initDarkMode);
                } else {
                  initDarkMode();
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className="antialiased"
      >
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
