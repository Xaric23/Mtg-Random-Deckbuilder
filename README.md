# MTG Commander Deck Builder

A Next.js application for building and managing Magic: The Gathering Commander decks.

[![Codecov](https://img.shields.io/codecov/c/github/Xaric23/Mtg-Random-Deckbuilder?logo=codecov)](https://codecov.io/gh/Xaric23/Mtg-Random-Deckbuilder)

## Recent Updates

### Version November 2025

**Major Improvements:**
- ✅ **Edge Runtime Compatibility**: Fixed middleware to work with Next.js Edge runtime (removed Node.js-specific `process.hrtime`)
- ✅ **Mobile Touch Support**: Fixed card preview dismissal on mobile devices with proper touch event handling
- ✅ **CI/CD Enhancements**: Added Codecov integration for test coverage reporting
- ✅ **Build Fixes**: Resolved TypeScript errors and build issues for production deployment
- ✅ **Error Handling**: Improved error handling and accessibility across components
- ✅ **Test Coverage**: Expanded unit test coverage for deck utilities and validation
- ✅ **Code Quality**: Applied ESLint fixes and hooks compliance improvements

**What's New:**
- Card preview now properly dismisses on mobile devices
- Middleware simplified for better Edge runtime compatibility
- Comprehensive test suite with 23+ passing tests
- GitHub Actions workflow with automated validation and deployment
- Service Worker improvements for PWA functionality

## Features

### Commander Features
### Commander Features
- **Commander Search**: Search for and select your commander
- **Commander Filters**: Filter commanders by color identity (W, U, B, R, G) and archetype (Aggro, Stax, Combo, Tribal, Voltron, Control)
- **Random Commander**: Pick a random commander with one click
- **EDHREC Integration**: Direct links to EDHREC commander pages for deck ideas and staples

### Deck Building
- **Card Search**: Search for cards filtered by commander color identity
- **Quick Filters**: One-click filters for Ramp, Draw, Removal, Board Wipes, and Tutors
- **Deck Building**: Add/remove cards, tag cards (Ramp/Draw/Removal)
- **Random Deck Generation**: Generate full random decks with configurable land counts and progress feedback
- **Advanced Randomization**: Control budget, power level, max CMC, and theme preferences
- **Land Controls**: Configure target land count, basic land percentage, MDFC land counting, and color preference

### Analytics & Visualization
- **Interactive Mana Curve**: Beautiful bar chart showing CMC distribution with color coding
- **Color Distribution**: Pie charts and detailed breakdowns of color pip requirements
- **Deck Statistics**: Comprehensive analytics including type breakdowns, tagged cards, and insights
- **Smart Recommendations**: AI-powered warnings and suggestions based on deck composition
- **Power Level Analysis**: Estimated competitive power level of your deck

### Collection Management
- **Owned Cards**: Upload a text file (TXT/CSV) with card names to mark cards as owned
- **Owned Cards Indicator**: Cards you own are highlighted in the decklist
- **Maybeboard**: Track cards you're considering adding to the deck

### Export & Sharing
- **Export Formats**: Export to MTGO, Arena, Moxfield, Moxfield (with tags), Archidekt, or standard format
- **Export with Tags**: Include card tags in exports for better organization
- **Share Decks**: Share via URL, copy to clipboard, or post to social media
- **Copy to Clipboard**: One-click copying for all export formats

### User Experience
- **Saved Decks**: Save and load decks from localStorage with custom names
- **Dark Mode**: Toggle between light and dark themes with browser compatibility
- **Card Previews**: Large card image previews on the left margin when hovering over cards
- **Keyboard Shortcuts**: Full keyboard navigation - press `?` to see all shortcuts
- **Loading States**: Visual feedback for all async operations (searching, generating, etc.)
- **Progress Feedback**: Real-time progress updates during deck generation
- **Browser Compatibility**: Works on modern and older browsers with graceful fallbacks

### Advanced Features
- **MDFC Support**: Option to count Modal Double-Faced Card land faces as lands
- **Color Identity Enforcement**: Automatically filters cards to match commander colors
- **Singleton Rules**: Prevents duplicate cards (except basic lands)
- **Deck Heuristics**: Warnings for low ramp, low draw, high mana costs, and low land counts
- **Toggle Statistics**: Show/hide detailed analytics to keep the interface clean

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

### Getting Started

1. **Select a Commander**: 
   - Search for a commander by name
   - Use color filters (W, U, B, R, G) to narrow down results
   - Use archetype filters (Aggro, Stax, Combo, etc.) to find specific playstyles
   - Click "Random Commander" to pick a random one

2. **Search Cards**: 
   - Use the search bar to find specific cards
   - Use quick filters (Ramp, Draw, Removal, Board Wipes, Tutors) for common needs
   - Cards are automatically filtered by commander color identity

3. **Build Your Deck**: 
   - Add cards to your deck (up to 99 cards)
   - Tag cards (Ramp/Draw/Removal) for better organization
   - Remove cards by clicking the "Remove" button

4. **Generate Random Deck**: 
   - Click "Random Deck" to generate a full deck
   - Watch progress updates as cards are added
   - Configure land settings before generating

5. **Manage Your Collection**: 
   - Upload a text file with card names to mark cards as owned
   - Cards you own are highlighted in the decklist
   - Format: One card name per line (e.g., "1 Lightning Bolt" or "Lightning Bolt")

6. **Export**: 
   - Copy your decklist in various formats (MTGO, Arena, Moxfield, Archidekt)
   - Export with tags for better organization
   - All formats are ready to paste into their respective platforms

7. **Save/Load**: 
   - Save decks with custom names
   - Load saved decks anytime
   - Decks are stored in browser localStorage

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
│   │   ├── CommanderSearch.tsx  # Commander search with filters
│   │   ├── CardSearch.tsx       # Card search component
│   │   ├── DeckList.tsx         # Deck list and analytics
│   │   ├── SavedDecks.tsx       # Saved decks management
│   │   ├── OwnedCards.tsx       # Owned cards management
│   │   ├── HoverPreview.tsx     # Card image preview
│   │   ├── InstallPrompt.tsx    # PWA install prompt
│   │   └── UpdateChecker.tsx    # Auto-update checker
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

- **Next.js 16** - React framework with App Router and Edge Runtime support
- **React 19** - Latest React with improved performance
- **TypeScript 5** - Type safety and modern JavaScript features
- **Vitest** - Fast unit testing with coverage reporting
- **ESLint** - Code quality and consistency
- **Scryfall API** - Comprehensive MTG card data
- **PWA** - Progressive Web App capabilities with offline support

## Development & Testing

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:watch
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues automatically
npm run lint:fix

# TypeScript type checking
npx tsc --noEmit
```

### Build & Deploy

```bash
# Development server
npm run dev

# Production build
npm run build

# Serve static build locally
npm run serve
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/Mtg-Random-Deckbuilder.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes: `npm run build` and `npm run serve`
6. Commit your changes: `git commit -m 'Add some feature'`
7. Push to the branch: `git push origin feature/your-feature-name`
8. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow React best practices (hooks, functional components)
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure all features work in both light and dark mode

## Roadmap

### Recently Implemented ✅
- ✅ **Interactive Mana Curve Visualization**: Beautiful interactive charts showing mana curve distribution with color-coded bars
- ✅ **Color Distribution Charts**: Visual pie charts and breakdowns of color pip distribution across your deck
- ✅ **Deck Statistics Dashboard**: Comprehensive analytics including card type breakdowns, tagged cards, and intelligent insights
- ✅ **Keyboard Shortcuts**: Full keyboard navigation support - press `?` to see all shortcuts
- ✅ **Share Functionality**: Share decks via URL, copy to clipboard, or post to Twitter
- ✅ **Advanced Randomization Controls**: Budget filters, power level targeting, max CMC limits, and theme preferences
- ✅ **EDHREC Integration**: Direct links to EDHREC commander pages from search results

### Planned Features
- **Commander AI Suggestions**: Enhanced AI-powered suggestions for synergistic themes and combos
- **Deckbuilding Automation**: One-click auto-build decks based on EDHREC staples and archetypes
- **Advanced Filtering**: More granular filters for card search (rarity, set, price ranges)
- **Deck Comparison**: Compare multiple saved decks side-by-side
- **Community Features**: User accounts, deck ratings, and comments
- **Enhanced Accessibility**: Improved screen reader support and ARIA labels
- **Mobile Optimization**: Enhanced touch controls and mobile-specific UI

## License

MIT

## Acknowledgments

- [Scryfall](https://scryfall.com/) for providing the excellent MTG card database API
- Next.js team for the amazing framework
- The MTG Commander community for inspiration and feedback
