import type { Card } from './types';
import { manaValue, isLand } from './deck';
import { COMMANDER_BANLIST } from './import';

export type PowerLevel = 'Casual' | 'Upgraded Precon' | 'Optimized' | 'cEDH';

export interface PowerLevelAnalysis {
  level: PowerLevel;
  score: number;
  factors: {
    ramp: number;
    draw: number;
    tutors: number;
    interaction: number;
    combos: number;
    averageCMC: number;
    curve: number;
  };
  warnings: string[];
  combos: string[];
}

// Known combos to detect
const KNOWN_COMBOS: Array<{ cards: string[]; name: string }> = [
  { cards: ['Thassa\'s Oracle', 'Demonic Consultation'], name: 'Thoracle Consultation' },
  { cards: ['Thassa\'s Oracle', 'Tainted Pact'], name: 'Thoracle Pact' },
  { cards: ['Laboratory Maniac', 'Demonic Consultation'], name: 'Lab Man Consultation' },
  { cards: ['Isochron Scepter', 'Dramatic Reversal'], name: 'Dramatic Scepter' },
  { cards: ['Kiki-Jiki, Mirror Breaker', 'Zealous Conscripts'], name: 'Kiki Conscripts' },
  { cards: ['Worldgorger Dragon', 'Animate Dead'], name: 'Worldgorger Combo' },
  { cards: ['Food Chain', 'Eternal Scourge'], name: 'Food Chain Combo' },
  { cards: ['Protean Hulk'], name: 'Hulk Combo' },
  { cards: ['Ad Nauseam'], name: 'Ad Nauseam' },
  { cards: ['Doomsday'], name: 'Doomsday' },
];

export function analyzePowerLevel(commander: Card | null, deck: Card[], mdfcAsLand: boolean): PowerLevelAnalysis {
  const nonlands = deck.filter(c => !isLand(c, mdfcAsLand));
  const lands = deck.filter(c => isLand(c, mdfcAsLand));
  
  // Count staples
  const ramp = deck.filter(c => c._tag === 'Ramp').length;
  const draw = deck.filter(c => c._tag === 'Draw').length;
  const removal = deck.filter(c => c._tag === 'Removal').length;
  
  // Count tutors
  const tutorKeywords = ['tutor', 'search your library', 'entomb', 'gamble'];
  const tutors = deck.filter(c => {
    const name = (c.name || '').toLowerCase();
    const typeLine = (c.type_line || '').toLowerCase();
    return tutorKeywords.some(kw => name.includes(kw) || typeLine.includes(kw)) ||
           typeLine.includes('tutor');
  }).length;
  
  // Count interaction (counterspells, removal)
  const interaction = removal + deck.filter(c => {
    const typeLine = (c.type_line || '').toLowerCase();
    return typeLine.includes('instant') && (
      (c.name || '').toLowerCase().includes('counter') ||
      (c.name || '').toLowerCase().includes('destroy') ||
      (c.name || '').toLowerCase().includes('exile')
    );
  }).length;
  
  // Calculate average CMC
  const totalCMC = nonlands.reduce((sum, c) => sum + manaValue(c), 0);
  const averageCMC = nonlands.length > 0 ? totalCMC / nonlands.length : 0;
  
  // Calculate curve quality (lower is better, but we want a smooth curve)
  const curve: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const c of nonlands) {
    const mv = Math.min(6, Math.floor(manaValue(c)));
    curve[mv]++;
  }
  const curveScore = Math.abs(curve[1] - curve[2]) + Math.abs(curve[2] - curve[3]) + Math.abs(curve[3] - curve[4]);
  
  // Detect combos
  const deckNames = new Set(deck.map(c => c.name.toLowerCase()));
  const foundCombos: string[] = [];
  for (const combo of KNOWN_COMBOS) {
    const foundCards = combo.cards.filter(cardName => 
      deckNames.has(cardName.toLowerCase())
    );
    if (foundCards.length === combo.cards.length) {
      foundCombos.push(combo.name);
    }
  }
  
  // Calculate power score
  let score = 0;
  score += Math.min(ramp, 15) * 2; // Ramp (max 30 points)
  score += Math.min(draw, 15) * 2; // Draw (max 30 points)
  score += Math.min(tutors, 10) * 3; // Tutors (max 30 points)
  score += Math.min(interaction, 20) * 1.5; // Interaction (max 30 points)
  score += foundCombos.length * 15; // Combos (15 points each)
  score += Math.max(0, 20 - averageCMC * 2); // Lower CMC = better (max 20 points)
  score += Math.max(0, 10 - curveScore / 10); // Smooth curve (max 10 points)
  
  // Determine power level
  let level: PowerLevel;
  if (score >= 150 || foundCombos.length >= 2) {
    level = 'cEDH';
  } else if (score >= 100 || foundCombos.length >= 1) {
    level = 'Optimized';
  } else if (score >= 60) {
    level = 'Upgraded Precon';
  } else {
    level = 'Casual';
  }
  
  // Generate warnings
  const warnings: string[] = [];
  if (ramp < 8) warnings.push('Low ramp count');
  if (draw < 8) warnings.push('Low card draw');
  if (tutors > 5) warnings.push('High tutor density (competitive)');
  if (averageCMC > 4) warnings.push('High average CMC');
  if (lands.length < 32) warnings.push('Low land count');
  
  // Check for banned cards
  const bannedCards = deck.filter(c => COMMANDER_BANLIST.includes(c.name));
  if (bannedCards.length > 0) {
    warnings.push(`Banned cards: ${bannedCards.map(c => c.name).join(', ')}`);
  }
  
  return {
    level,
    score: Math.round(score),
    factors: {
      ramp,
      draw,
      tutors,
      interaction,
      combos: foundCombos.length,
      averageCMC: Math.round(averageCMC * 10) / 10,
      curve: Math.round(curveScore * 10) / 10,
    },
    warnings,
    combos: foundCombos,
  };
}

