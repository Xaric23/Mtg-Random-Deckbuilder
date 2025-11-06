import type { Card } from './types';

interface StrategyPattern {
  keywords: string[];
  cmcPreference?: 'low' | 'medium' | 'high';
  powerPreference?: 'low' | 'medium' | 'high';
  complexityPreference?: 'low' | 'medium' | 'high';
  colorPreference?: string[];
  typelineImportance?: 'low' | 'medium' | 'high';
  synergyPreference?: 'low' | 'medium' | 'high';
  spellPreference?: 'low' | 'medium' | 'high';
  tokenPreference?: 'low' | 'medium' | 'high';
  graveyardPreference?: 'low' | 'medium' | 'high';
  cardAdvantagePreference?: 'low' | 'medium' | 'high';
}

// Keywords and patterns for each strategy
const strategyPatterns: Record<string, StrategyPattern> = {
  aggro: {
    keywords: ['attack', 'combat', 'damage', 'haste', 'double strike', 'first strike', 'trample'],
    cmcPreference: 'low',
    powerPreference: 'high',
  },
  combo: {
    keywords: ['whenever', 'trigger', 'copy', 'untap', 'create', 'token', 'sacrifice'],
    cmcPreference: 'medium',
    complexityPreference: 'high',
  },
  control: {
    keywords: ['counter', 'destroy', 'exile', 'return', 'tap', "can't", 'prevent'],
    cmcPreference: 'medium',
    colorPreference: ['blue', 'black', 'white'],
  },
  value: {
    keywords: ['draw', 'search', 'scry', 'investigate', 'treasure', 'card', 'mana'],
    cmcPreference: 'medium',
    cardAdvantagePreference: 'high',
  },
  tribal: {
    keywords: ['creature type', 'tribal', 'lord', 'other', 'you control'],
    typelineImportance: 'high',
    synergyPreference: 'high',
  },
  spellslinger: {
    keywords: ['instant', 'sorcery', 'cast', 'copy', 'spell', 'magecraft'],
    spellPreference: 'high',
  },
  tokens: {
    keywords: ['create', 'token', 'creature tokens', 'populate', 'copy'],
    tokenPreference: 'high',
  },
  graveyard: {
    keywords: ['graveyard', 'return', 'exile', 'flashback', 'escape', 'resurrect'],
    graveyardPreference: 'high',
  },
};

export function calculateStrategyScore(card: Card, strategy: string): number {
  const pattern = strategyPatterns[strategy as keyof typeof strategyPatterns];
  if (!pattern) return 0;

  let score = 0;
  const text = (card.oracle_text || '').toLowerCase();
  const typeLine = (card.type_line || '').toLowerCase();

  // Keyword matching
  // Increase keyword weight to favor pattern matches
  pattern.keywords.forEach(keyword => {
    const matches = (text.match(new RegExp(keyword, 'gi')) || []).length;
    score += matches * 3; // was 2
  });

  // CMC preferences
  const cmc = card.cmc || 0;
  if (pattern.cmcPreference === 'low' && cmc <= 4) score += 4; // was 3
  if (pattern.cmcPreference === 'medium' && cmc >= 4 && cmc <= 6) score += 4; // was 3
  if (pattern.cmcPreference === 'high' && cmc >= 6) score += 4; // was 3

  // Color identity alignment
  if (pattern.colorPreference) {
    const colors = card.color_identity || [];
    const preferredColors = pattern.colorPreference;
    const colorMatch = preferredColors.filter((c: string) => colors.includes(c)).length;
    score += colorMatch * 3; // was 2
  }

  // Type line relevance
  if (pattern.typelineImportance === 'high') {
    pattern.keywords.forEach(keyword => {
      if (typeLine.includes(keyword.toLowerCase())) score += 6; // was 5
    });
  }

  // Special scoring for tribal commanders
  if (strategy === 'tribal') {
    const hasTribalEffect = text.includes('creature type') || 
                          text.match(/other .+ you control/i) ||
                          text.match(/each .+ you control/i);
    if (hasTribalEffect) score += 8; // was 5
  }

  // Power/Toughness considerations for aggro
  if (strategy === 'aggro' && card.power && card.toughness) {
    const power = parseInt(card.power);
    if (!isNaN(power) && power >= 4) score += 3;
  }

  return score;
}

export async function analyzeCommanderStrategy(commanders: Card[], strategy: string): Promise<Card[]> {
  // Score each commander
  const scoredCommanders = commanders.map(commander => ({
    commander,
    score: calculateStrategyScore(commander, strategy)
  }));

  // Sort by score descending
  scoredCommanders.sort((a, b) => b.score - a.score);

  // Return just the commanders in sorted order
  return scoredCommanders.map(sc => sc.commander);
}

export function buildQueryForStrategy(strategy: string): string {
  const baseQuery = 'is:commander -is:digital';
  const patterns = strategyPatterns[strategy as keyof typeof strategyPatterns];
  
  if (!patterns) return baseQuery;

  // Add strategy-specific keywords to the query
  const keywordQuery = patterns.keywords
    .slice(0, 3) // Take only first 3 keywords to avoid too-specific queries
    .map(k => `o:"${k}"`)
    .join(' OR ');

  return `${baseQuery} (${keywordQuery})`;
}