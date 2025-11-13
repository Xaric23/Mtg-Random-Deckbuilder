# GitHub Copilot Instructions

This repository contains a Next.js application for building Magic: The Gathering Commander decks. Follow these guidelines when contributing code.

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode enabled)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest with Istanbul coverage
- **Linting**: ESLint with Next.js config
- **API**: Scryfall API for MTG card data

## Code Style & Conventions

### TypeScript
- Always use TypeScript for all new code
- Enable strict type checking - no `any` types without justification
- Use explicit return types for functions
- Define interfaces in `src/lib/types.ts` for shared types
- Follow the existing codebase pattern of using interfaces for object shapes

### React
- Use functional components with React hooks exclusively
- Prefer named exports over default exports for components
- Use React 19 features appropriately (automatic batching, transitions)
- Components should be in `src/components/` directory
- Keep components focused and single-purpose
- Use client components (`'use client'`) only when necessary (interactivity, hooks, browser APIs)

### Naming Conventions
- Components: PascalCase (e.g., `CommanderSearch.tsx`)
- Functions/variables: camelCase (e.g., `cardName`, `manaCost`)
- Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_LAND_COUNT`)
- Type/Interface names: PascalCase (e.g., `Card`, `DeckState`)
- File names: Match the primary export (PascalCase for components, camelCase for utilities)

### Code Organization
- **Components**: `src/components/` - React components
- **Utilities**: `src/lib/` - Utility functions, helpers, and business logic
- **Types**: `src/lib/types.ts` - Shared TypeScript interfaces and types
- **API Routes**: `src/app/api/` - Next.js API routes (currently Scryfall proxy)
- **Tests**: `src/lib/__tests__/` - Vitest test files (`.test.ts` or `.test.tsx`)

## Testing Requirements

### Unit Tests
- Write unit tests for all utility functions in `src/lib/`
- Test files should be in `src/lib/__tests__/` directory
- Use descriptive test names: `it('should return card name or Unknown for null')`
- Follow existing test patterns using Vitest's `describe`, `it`, `expect` syntax
- Mock external dependencies (Scryfall API calls, localStorage)

### Test Commands
```bash
npm test              # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Coverage Goals
- Aim for meaningful test coverage, especially for critical business logic
- Focus on testing edge cases and error handling
- Don't write tests just to hit coverage numbers

## Build & Development

### Commands
```bash
npm run dev           # Start development server (localhost:3000)
npm run build         # Build production version (automatically exports to 'out' directory)
npm run serve         # Serve static build locally from 'out' directory
npm run lint          # Run ESLint
npm run lint:fix      # Run ESLint with auto-fix
```

**Note**: The repository is configured with `output: 'export'` in `next.config.ts`, which means `npm run build` automatically generates a static export to the `out/` directory. This static site can be deployed to any static hosting service without requiring a Node.js server.

### Before Committing
1. Run `npm run lint` and fix all issues
2. Run `npm test` and ensure all tests pass
3. Run `npm run build` to verify the build succeeds
4. Test your changes in the browser

## Security Best Practices

### General Security
- Never commit secrets, API keys, or credentials
- Validate and sanitize all user input
- Use Content Security Policy headers (configured in `next.config.ts`)
- Keep dependencies updated (check `npm audit`)

### API Security
- All Scryfall API calls should exclude Alchemy and Arena-only cards
- Use the Scryfall proxy in `src/app/api/scryfall/` to avoid CORS issues
- Handle API errors gracefully with user-friendly messages

### Client-Side Security
- localStorage data is user-specific and non-sensitive (saved decks, owned cards)
- Never store sensitive information in localStorage
- Sanitize card names and deck names before storage

## Domain-Specific Context

### Magic: The Gathering Rules
- **Commander Format**: 100 cards total (1 commander + 99 others)
- **Singleton Rule**: Only one copy of each card (except basic lands)
- **Color Identity**: Cards must match commander's color identity
- **MDFC (Modal Double-Faced Cards)**: Can count land face as land

### Scryfall API
- Base URL: `https://api.scryfall.com`
- Rate limit: Be respectful, batch requests when possible
- Card search syntax: Use Scryfall's query syntax (e.g., `f:commander id:wubrg`)
- Exclude digital-only: Always add `-is:alchemy -is:arena` to searches
- Use pagination for large result sets (`page` parameter)

### Key Features to Preserve
- **Random Deck Generation**: Core feature, maintain stability
- **Card Search & Filtering**: Must respect commander color identity
- **Owned Cards Tracking**: Upload TXT/CSV, highlight owned cards
- **Export Formats**: MTGO, Arena, Moxfield, Archidekt - maintain compatibility
- **PWA Support**: App should work offline with service worker caching

## Common Patterns

### Fetching Cards
```typescript
// Use the Scryfall proxy
const response = await fetch('/api/scryfall/cards/search?q=...');
const data = await response.json();
```

### Working with Card Types
```typescript
import type { Card } from '@/lib/types';

function processCard(card: Card | null) {
  if (!card) return 'Unknown';
  return card.name;
}
```

### State Management
- Use React hooks (`useState`, `useEffect`, `useReducer`) for state
- Use localStorage for persistence (via `src/lib/storage.ts`)
- Keep state close to where it's used
- Lift state only when necessary for sharing

### Error Handling
```typescript
try {
  const result = await fetchCards(query);
  // Handle success
} catch (error) {
  console.error('Failed to fetch cards:', error);
  // Show user-friendly error message
}
```

## UI/UX Guidelines

### Accessibility
- Use semantic HTML elements
- Include `aria-label` for icon buttons
- Ensure keyboard navigation works
- Support both light and dark modes (Tailwind dark: classes)

### Loading States
- Show loading indicators for async operations
- Provide progress feedback for long operations (e.g., deck generation)
- Disable buttons during loading to prevent duplicate requests

### Responsive Design
- Mobile-first approach with Tailwind
- Test on mobile, tablet, and desktop viewports
- Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`

### Dark Mode
- All new UI must support both light and dark themes
- Use Tailwind's `dark:` variants
- Test appearance in both modes

## Documentation

### Code Comments
- Add comments for complex logic or non-obvious decisions
- Use JSDoc for exported functions with complex signatures
- Avoid obvious comments (e.g., `// Set the value` for `setValue(x)`)

### README Updates
- Update README.md if adding new features or changing setup
- Document new environment variables or configuration
- Update the feature list if applicable

## What to Avoid

- ❌ Don't use `any` type without strong justification
- ❌ Don't create class components (use functional components only)
- ❌ Don't install new dependencies without discussion
- ❌ Don't modify the singleton rule or color identity enforcement
- ❌ Don't break the static export capability (configured via `output: 'export'` in next.config.ts)
- ❌ Don't add server-side state or databases (this is a client-side only app)
- ❌ Don't bypass ESLint rules without comment justification
- ❌ Don't remove existing tests

## Pull Request Guidelines

- Keep PRs focused on a single feature or bug fix
- Write clear commit messages describing the change
- Include tests for new functionality
- Update documentation if behavior changes
- Ensure all CI checks pass (lint, test, build)
- Test the PWA/static export functionality if you modify build process

## Questions?

If you're unsure about any of these guidelines or need clarification on the codebase architecture, please ask before making significant changes.
