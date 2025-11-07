'use client';

import { useState } from 'react';
import type { Card } from '@/lib/types';
import { searchCommanders } from '@/lib/scryfall';
import { analyzeCommanderStrategy, buildQueryForStrategy } from '../lib/commanderAI';

interface AICommanderSuggestionProps {
  onSelect: (card: Card) => void;
}

export function AICommanderSuggestion({ onSelect }: AICommanderSuggestionProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Card[]>([]);
  const [strategy, setStrategy] = useState<string>('');

  const strategies = [
    { value: 'aggro', label: 'Aggressive (Combat & Fast)' },
    { value: 'combo', label: 'Combo (Complex Interactions)' },
    { value: 'control', label: 'Control (Defensive & Reactive)' },
    { value: 'value', label: 'Value (Card Advantage & Resources)' },
    { value: 'tribal', label: 'Tribal (Creature Type Synergy)' },
    { value: 'spellslinger', label: 'Spellslinger (Instant/Sorcery Focus)' },
    { value: 'tokens', label: 'Tokens (Go Wide Strategy)' },
    { value: 'graveyard', label: 'Graveyard (Recursion & Reanimation)' }
  ];

  const handleStrategySelect = async (selectedStrategy: string) => {
    setLoading(true);
    setStrategy(selectedStrategy);
    try {
      // First, get a pool of potential commanders
      const query = buildQueryForStrategy(selectedStrategy);
      const commanders = await searchCommanders(query);
      
      // Analyze and rank commanders based on the chosen strategy
      const rankedCommanders = await analyzeCommanderStrategy(commanders, selectedStrategy);
      
      // Take top 5 suggestions
      setSuggestions(rankedCommanders.slice(0, 5));
    } catch (error) {
      console.error('Error suggesting commanders:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-suggestion-container p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">AI Commander Suggestions</h3>
      
      <div className="strategy-selection mb-4" role="group" aria-labelledby="strategy-label">
        <label id="strategy-label" className="block text-sm font-medium mb-2">Select Your Preferred Strategy:</label>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {strategies.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleStrategySelect(value)}
              className={`px-3 py-2 rounded-md text-sm ${
                strategy === value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              aria-pressed={strategy === value}
              role="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Analyzing commanders...</p>
        </div>
      )}

      {suggestions.length > 0 && !loading && (
        <div className="suggestions-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {suggestions.map((card) => (
            <div
              key={card.id}
              className="commander-card p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 cursor-pointer"
              onClick={() => onSelect(card)}
            >
              <h4 className="font-medium mb-1">{card.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{card.type_line}</p>
              {card.oracle_text && (
                <p className="text-sm mt-2 line-clamp-3">{card.oracle_text}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}