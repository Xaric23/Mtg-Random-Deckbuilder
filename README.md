# MTG Commander Deck Builder

A Next.js application for building and managing Magic: The Gathering Commander decks.

## Features

- **Commander Search**: Search for and select your commander
- **Card Search**: Search for cards filtered by commander color identity
- **Deck Building**: Add/remove cards, tag cards (Ramp/Draw/Removal)
- **Random Deck Generation**: Generate full random decks with configurable land counts
- **Deck Analytics**: View curve, color pip distribution, and heuristics warnings
- **Export Formats**: Export to MTGO, Arena, Moxfield, or standard format
- **Saved Decks**: Save and load decks from localStorage
- **Dark Mode**: Toggle between light and dark themes
- **Card Previews**: Hover over cards to see image previews
- **MDFC Support**: Option to count Modal Double-Faced Card land faces as lands

## Getting Started

### Prerequisites

- Node.js 18.18 or later
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Generate PWA icons (optional, requires `sharp`):
```bash
npm install sharp --save-dev
npm run generate-icons
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building Static Version

This app can be built as a completely static site that runs without a Node.js server:

1. Build the static export:
```bash
npm run build
```

2. The static files will be in the `out` directory:
```bash
out/
├── index.html
├── manifest.json
├── sw.js
├── _next/
└── ...
```

3. Test the static build locally:
```bash
npm run serve
```
This starts a simple HTTP server on port 3000 to test the static build.

4. Deploy the `out` directory to any static hosting:
   - **GitHub Pages**: Push the `out` folder contents to `gh-pages` branch
   - **Netlify**: Set build directory to `out`, deploy command: `npm run build`
   - **Vercel**: Automatically detects static export
   - **Any web server**: Just upload the `out` folder contents to your web root
   - **CDN/Static Hosting**: Works on any service that serves static files

5. The app works entirely client-side - no Node.js server needed! All API calls go directly to Scryfall from the browser.

## Installing as a Web App

### Desktop (Chrome/Edge)

1. Look for the install icon in the address bar
2. Click "Install" to add to your desktop
3. The app will open in its own window

### Mobile (iOS)

1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will appear on your home screen

### Mobile (Android)

1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Install app" or "Add to Home screen"
4. The app will appear on your home screen

## PWA Features

- **Offline Support**: Basic caching for offline use
- **Installable**: Can be installed on desktop and mobile devices
- **App-like Experience**: Runs in standalone mode without browser UI
- **Responsive Design**: Optimized for mobile and desktop screens

## Usage

1. **Select a Commander**: Search for or pick a random commander
2. **Search Cards**: Use the search bar or quick filters (Ramp, Draw, Removal, etc.)
3. **Build Your Deck**: Add cards to your deck (up to 99 cards)
4. **Tag Cards**: Use the tag dropdown to categorize cards
5. **Generate Random Deck**: Click "Random Deck" to generate a full deck
6. **Export**: Copy your decklist in various formats
7. **Save/Load**: Save decks with names and load them later

## Project Structure

```
deckbuilder/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── scryfall/        # Scryfall API proxy
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Main deck builder page
│   ├── components/
│   │   ├── CommanderSearch.tsx  # Commander search component
│   │   ├── CardSearch.tsx       # Card search component
│   │   ├── DeckList.tsx         # Deck list and analytics
│   │   ├── SavedDecks.tsx       # Saved decks management
│   │   └── HoverPreview.tsx     # Card image preview
│   └── lib/
│       ├── types.ts              # TypeScript types
│       ├── scryfall.ts           # Scryfall API helpers
│       ├── deck.ts               # Deck utilities
│       ├── export.ts             # Export formatters
│       └── storage.ts            # localStorage helpers
└── package.json
```

## API

The app uses the [Scryfall API](https://scryfall.com/docs/api) for card data. All searches automatically exclude Alchemy and Arena-only cards to ensure paper legality.

## Technologies

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Scryfall API** - Card data

## License

MIT
