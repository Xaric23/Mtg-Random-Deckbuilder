'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Card, SavedDeck } from '@/lib/types';
import { CommanderSearch } from '@/components/CommanderSearch';
import { AICommanderSuggestion } from '@/components/AICommanderSuggestion';
import { CardSearch } from '@/components/CardSearch';
import { DeckList } from '@/components/DeckList';
import { SavedDecks } from '@/components/SavedDecks';
import { HoverPreview } from '@/components/HoverPreview';
import { InstallPrompt } from '@/components/InstallPrompt';
import { UpdateChecker } from '@/components/UpdateChecker';
import { Maybeboard } from '@/components/Maybeboard';
import { ImportDeck } from '@/components/ImportDeck';
import { PowerLevel } from '@/components/PowerLevel';
import { Playtest } from '@/components/Playtest';
import { ManaCurveChart } from '@/components/ManaCurveChart';
import { ColorDistribution } from '@/components/ColorDistribution';
import { DeckStats } from '@/components/DeckStats';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { ShareDeck } from '@/components/ShareDeck';
import { analyzePowerLevel } from '@/lib/powerLevel';
import { setupHotkeys, type HotkeyHandler } from '@/lib/hotkeys';
import {
  fetchCardById,
  fetchNamedCard,
  getRandomCard,
} from '@/lib/scryfall';
import {
  isLand,
  isDuplicateInDeck,
  isColorlessOnly,
  producesCommanderColors,
  getBasicLandNamesForCI,
} from '@/lib/deck';
import { saveState, getDarkMode, setDarkMode } from '@/lib/storage';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [commander, setCommander] = useState<Card | null>(null);
  const [deck, setDeck] = useState<Card[]>([]);
  const [darkMode, setDarkModeState] = useState(false);
  const [mdfcAsLand, setMdfcAsLand] = useState(true);
  const [targetLands, setTargetLands] = useState(32);
  const [basicsPercent, setBasicsPercent] = useState(60);
  const [preferColorLands, setPreferColorLands] = useState(true);
  const [avoidColorlessLands, setAvoidColorlessLands] = useState(true);
  const [hoverCard, setHoverCard] = useState<Card | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [generatingDeck, setGeneratingDeck] = useState(false);
  const [deckGenStatus, setDeckGenStatus] = useState<string>('');
  const [maybeboard, setMaybeboard] = useState<Card[]>([]);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // Refs for performance optimization
  const debouncedSaveRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const loadingRef = useRef<boolean>(false);

  // Load state on mount (client-side only) with browser compatibility
  useEffect(() => {
    setMounted(true);
    try {
      const saved = getDarkMode();
      setDarkModeState(saved);
      if (typeof document !== 'undefined') {
        try {
          const htmlEl = document.documentElement;
          const bodyEl = document.body;
          if (htmlEl && bodyEl) {
            if (htmlEl.classList && bodyEl.classList) {
              // Modern browsers with classList support
              if (saved) {
                htmlEl.classList.add('dark');
                bodyEl.classList.add('dark');
              } else {
                htmlEl.classList.remove('dark');
                bodyEl.classList.remove('dark');
              }
            } else {
              // Fallback for older browsers
              if (saved) {
                htmlEl.className += ' dark';
                bodyEl.className += ' dark';
              } else {
                htmlEl.className = htmlEl.className.replace(/ dark/g, '');
                bodyEl.className = bodyEl.className.replace(/ dark/g, '');
              }
            }
          }
        } catch (e) {
          console.warn('Error loading dark mode:', e);
        }
      }
    } catch (e) {
      console.warn('Error loading dark mode from storage:', e);
    }

    // Load deck state
    if (typeof window !== 'undefined') {
      // Helper function to load deck cards from IDs
      const loadDeckFromIds = async (deckIds: string[]) => {
        const cards: Card[] = [];
        for (let i = 0; i < deckIds.length; i += 20) {
          const chunk = deckIds.slice(i, i + 20);
          const fetched = await Promise.all(chunk.map((id: string) => fetchCardById(id)));
          cards.push(...fetched.filter(Boolean) as Card[]);
          await sleep(80);
        }
        setDeck(cards);
      };

      // Check for shared deck in URL first
      const urlParams = new URLSearchParams(window.location.search);
      const sharedDeck = urlParams.get('deck');
      
      if (sharedDeck) {
        try {
          const decoded = atob(sharedDeck);
          const parsed = JSON.parse(decoded);
          
          // Load commander if present
          if (parsed.c) {
            fetchCardById(parsed.c).then(c => {
              if (c) setCommander(c);
            });
          }
          
          // Load deck cards
          if (Array.isArray(parsed.d) && parsed.d.length) {
            loadDeckFromIds(parsed.d);
          }
        } catch (e) {
          console.warn('Error loading shared deck from URL:', e);
        }
      } else {
        // Load from localStorage if no shared deck in URL
        const state = localStorage.getItem('edh_builder_state');
        if (state) {
          try {
            const parsed = JSON.parse(state);
            if (parsed.commanderId) {
              fetchCardById(parsed.commanderId).then(c => {
                if (c) setCommander(c);
              });
            }
            if (Array.isArray(parsed.deckIds) && parsed.deckIds.length) {
              loadDeckFromIds(parsed.deckIds);
            }
          } catch {}
        }
      }
    }
  }, []);

  // Save state whenever deck/commander changes (only after mount)
  // Don't save empty state - this prevents clearing after import
  useEffect(() => {
    if (mounted && (commander || deck.length > 0)) {
      if (debouncedSaveRef.current) {
        clearTimeout(debouncedSaveRef.current);
      }
      debouncedSaveRef.current = setTimeout(() => {
        saveState(commander, deck);
      }, 1000); // Debounce saving for 1 second
    }
    return () => {
      if (debouncedSaveRef.current) {
        clearTimeout(debouncedSaveRef.current);
      }
    };
  }, [commander, deck, mounted]);

  // Dark mode toggle with better browser compatibility
  const toggleDarkMode = useCallback(() => {
    const newMode = !darkMode;
    setDarkModeState(newMode);
    try {
      setDarkMode(newMode);
    } catch (e) {
      // Fallback for browsers that don't support localStorage
      console.warn('localStorage not available:', e);
    }
    if (typeof document !== 'undefined') {
      try {
        const htmlEl = document.documentElement;
        const bodyEl = document.body;
        if (htmlEl && bodyEl) {
          if (htmlEl.classList && bodyEl.classList) {
            // Modern browsers with classList support
            if (newMode) {
              htmlEl.classList.add('dark');
              bodyEl.classList.add('dark');
            } else {
              htmlEl.classList.remove('dark');
              bodyEl.classList.remove('dark');
            }
          } else {
            // Fallback for older browsers
            if (newMode) {
              htmlEl.className += ' dark';
              bodyEl.className += ' dark';
            } else {
              htmlEl.className = htmlEl.className.replace(/ dark/g, '');
              bodyEl.className = bodyEl.className.replace(/ dark/g, '');
            }
          }
        }
      } catch (e) {
        console.warn('Error toggling dark mode:', e);
      }
    }
  }, [darkMode]);

  const handleSelectCommander = useCallback((c: Card) => {
    setCommander(c);
    setDeck([]);
  }, []);

  const handleAddCard = useCallback((card: Card) => {
    setDeck(prev => {
      if (prev.length >= 99) return prev;
      if (isDuplicateInDeck(card, prev)) return prev;
      return [...prev, card];
    });
  }, []);

  const handleRemoveCard = useCallback((cardId: string) => {
    setDeck(prev => prev.filter(c => c.id !== cardId));
  }, []);

  const handleTagCard = useCallback((cardId: string, tag: 'Ramp' | 'Draw' | 'Removal' | '') => {
    setDeck(prev => prev.map(c => c.id === cardId ? { ...c, _tag: tag || undefined } : c));
  }, []);

  const handleSaveDeck = useCallback(() => {
    const name = prompt('Enter deck name:');
    if (!name?.trim()) return;
    const decks = JSON.parse(localStorage.getItem('edh_saved_decks') || '{}');
    if (decks[name] && !confirm('Overwrite existing deck?')) return;
    decks[name] = { commanderId: commander?.id || null, deckIds: deck.map(c => c.id) };
    localStorage.setItem('edh_saved_decks', JSON.stringify(decks));
    alert('Deck saved.');
  }, [commander, deck]);

  const handleLoadDeck = useCallback(async (saved: SavedDeck) => {
    if (loadingRef.current) return; // Prevent concurrent loads
    loadingRef.current = true;
    setDeckGenStatus('Loading deck...');
    
    try {
      if (saved.commanderId) {
        const c = await fetchCardById(saved.commanderId);
        if (c) setCommander(c);
      }
      setDeck([]);
      
      if (Array.isArray(saved.deckIds) && saved.deckIds.length) {
        const cards: Card[] = [];
        const chunkSize = 20;
        
        for (let i = 0; i < saved.deckIds.length; i += chunkSize) {
          if (!loadingRef.current) break; // Allow cancellation
          const chunk = saved.deckIds.slice(i, i + chunkSize);
          const fetched = await Promise.all(chunk.map((id: string) => fetchCardById(id)));
          cards.push(...fetched.filter(Boolean) as Card[]);
          setDeckGenStatus(`Loading deck... ${Math.min(100, Math.round((i + chunkSize) / saved.deckIds.length * 100))}%`);
          await sleep(80);
        }
        
        if (loadingRef.current) { // Only update if not cancelled
          setDeck(cards);
          setDeckGenStatus('Deck loaded successfully!');
          setTimeout(() => setDeckGenStatus(''), 2000);
        }
      }
    } catch (error) {
      console.error('Error loading deck:', error);
      setDeckGenStatus('Error loading deck. Please try again.');
      setTimeout(() => setDeckGenStatus(''), 3000);
    } finally {
      loadingRef.current = false;
    }
  }, []);

  const handleReset = useCallback(() => {
    setCommander(null);
    setDeck([]);
    localStorage.removeItem('edh_builder_state');
  }, []);

  const handleGenerateRandomDeck = useCallback(async () => {
    if (!commander || generatingDeck) return;
    
    setGeneratingDeck(true);
    setDeckGenStatus('Starting deck generation...');
    setDeck([]);
    
    try {
      const target = Math.max(32, Math.min(60, targetLands));
      const basicsPct = Math.max(0, Math.min(100, basicsPercent));

      // Add nonlands first
      const ci = commander.color_identity || [];
      setDeckGenStatus(`Generating non-land cards...`);
      const nonlands: Card[] = [];
      const nonlandCount = 99 - target;
      let added = 0;
      for (let guard = 0; guard < nonlandCount * 6 && added < nonlandCount; guard++) {
        const c = await getRandomCard(ci, '-t:land');
        if (c && !isDuplicateInDeck(c, nonlands)) {
          nonlands.push(c);
          added++;
          if (added % 10 === 0) {
            setDeckGenStatus(`Generated ${added}/${nonlandCount} non-land cards...`);
            setDeck([...nonlands]);
          }
        }
        await sleep(40);
      }
      setDeck(nonlands);
      setDeckGenStatus(`Generated ${nonlands.length} non-land cards. Adding lands...`);

      // Add lands
      const desiredBasics = Math.round(target * (basicsPct / 100));
      const basics = getBasicLandNamesForCI(ci.join(''));
      const newDeck = [...nonlands];
      let basicsAdded = 0;
      setDeckGenStatus(`Adding basic lands (${desiredBasics} needed)...`);
      while (basicsAdded < desiredBasics) {
        const name = basics[Math.floor(Math.random() * basics.length)];
        const card = await fetchNamedCard(name);
        if (card) {
          newDeck.push(card);
          basicsAdded++;
          if (basicsAdded % 5 === 0) {
            setDeckGenStatus(`Added ${basicsAdded}/${desiredBasics} basic lands...`);
            setDeck([...newDeck]);
          }
        }
        await sleep(20);
      }
      setDeck(newDeck);

      // Add color-producing nonbasic lands
      let need = target - desiredBasics;
      setDeckGenStatus(`Adding non-basic lands (${need} needed)...`);
      const finalDeck = [...newDeck];
      let landsAdded = 0;
      while (need > 0 && landsAdded < target * 2) {
        const c = await getRandomCard(ci, 't:land -type:basic');
        if (c) {
          if (preferColorLands && !producesCommanderColors(c, ci)) continue;
          if (avoidColorlessLands && isColorlessOnly(c)) continue;
          if (!isDuplicateInDeck(c, finalDeck)) {
            finalDeck.push(c);
            need--;
            landsAdded++;
            if (landsAdded % 5 === 0) {
              setDeckGenStatus(`Added ${landsAdded} non-basic lands (${need} remaining)...`);
              setDeck([...finalDeck]);
            }
          }
        }
        await sleep(35);
      }
      setDeck(finalDeck);
      
      const total = finalDeck.length;
      const landCount = finalDeck.filter(c => isLand(c, mdfcAsLand)).length;
      setDeckGenStatus(`Deck generated! ${total} cards (${landCount} lands)`);
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setDeckGenStatus('');
      }, 3000);
    } catch (error) {
      console.error('Error generating deck:', error);
      setDeckGenStatus('Error generating deck. Please try again.');
      setTimeout(() => {
        setDeckGenStatus('');
      }, 5000);
    } finally {
      setGeneratingDeck(false);
    }
  }, [commander, targetLands, basicsPercent, preferColorLands, avoidColorlessLands, generatingDeck, mdfcAsLand]);

  const handleMouseMove = useCallback((e: React.MouseEvent, card: Card | null) => {
    setHoverCard(card);
    setHoverPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverCard(null);
  }, []);

  // Power level analysis
  const powerLevelAnalysis = commander && deck.length > 0 
    ? analyzePowerLevel(commander, deck, mdfcAsLand)
    : null;

  // Import deck handler
  const handleImportDeck = useCallback((commander: Card | null, deck: Card[], maybeboard: Card[]) => {
    // Only update if we got valid data - don't reset if import partially failed
    if (deck.length > 0 || commander !== null) {
      setCommander(commander);
      setDeck(deck);
      setMaybeboard(maybeboard || []);
    } else {
      console.warn('Import resulted in empty deck and no commander');
    }
  }, []);

  // Maybeboard handlers
  const handleAddToDeckFromMaybeboard = useCallback((card: Card) => {
    if (deck.length >= 99) {
      alert('Deck is full (99 cards plus 1 commander).');
      return;
    }
    setDeck(prev => [...prev, card]);
    setMaybeboard(prev => prev.filter(c => c.id !== card.id));
  }, [deck]);

  const handleRemoveFromMaybeboard = useCallback((cardId: string) => {
    setMaybeboard(prev => prev.filter(c => c.id !== cardId));
  }, []);

  const handleAddToMaybeboard = useCallback((card: Card) => {
    setMaybeboard(prev => {
      if (prev.some(c => c.id === card.id)) return prev;
      return [...prev, card];
    });
  }, []);

  // Hotkeys setup
  useEffect(() => {
    const handlers: HotkeyHandler[] = [
      { action: 'search-commander', handler: () => {
        const input = document.querySelector('input[placeholder*="commander"]') as HTMLInputElement;
        input?.focus();
      }, description: 'Search commander' },
      { action: 'search-cards', handler: () => {
        const input = document.querySelector('input[placeholder*="cards"]') as HTMLInputElement;
        input?.focus();
      }, description: 'Search cards' },
      { action: 'random-deck', handler: handleGenerateRandomDeck, description: 'Random deck' },
      { action: 'toggle-dark-mode', handler: toggleDarkMode, description: 'Toggle dark mode' },
      { action: 'reset-deck', handler: handleReset, description: 'Reset deck' },
      { action: 'show-help', handler: () => setShowKeyboardHelp(true), description: 'Show keyboard shortcuts' },
    ];
    
    const cleanup = setupHotkeys(handlers);
    return cleanup;
  }, [handleGenerateRandomDeck, toggleDarkMode, handleReset]);

  return (
    <div className="container">
      <h1>MTG Commander Deck Builder</h1>

      <div className="small muted" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
        <button className="btn" onClick={() => setShowKeyboardHelp(true)} title="Keyboard shortcuts (?)">
          ⌨️
        </button>
        <button className="btn" onClick={() => setShowStats(!showStats)} title="Toggle statistics">
          📊 {showStats ? 'Hide' : 'Show'} Stats
        </button>
        <label>
          <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} /> Dark mode
        </label>
        <button className="btn" onClick={handleSaveDeck}>
          Save Deck
        </button>
        <ShareDeck commander={commander} deck={deck} />
      </div>

          <div className="space-y-4">
            <CommanderSearch
              onSelect={handleSelectCommander}
              onHover={(card, e) => handleMouseMove(e, card)}
              onMouseLeave={handleMouseLeave}
            />
            <AICommanderSuggestion onSelect={handleSelectCommander} />
          </div>      {commander && (
        <section className="col">
          <div
            onMouseMove={(e) => handleMouseMove(e, commander)}
            onMouseLeave={handleMouseLeave}
          >
            <h3>
              {commander.name} {commander.mana_cost && <span className="muted small">({commander.mana_cost})</span>}
            </h3>
            <div className="small muted">
              {commander.type_line || ''} {commander.color_identity?.map(c => <span key={c} className="pill">{c}</span>)}
            </div>
          </div>
        </section>
      )}

      {commander && (
        <>
          <CardSearch
            commander={commander}
            deck={deck}
            onAddCard={handleAddCard}
            onGenerateRandomDeck={handleGenerateRandomDeck}
            mdfcAsLand={mdfcAsLand}
            setMdfcAsLand={setMdfcAsLand}
            targetLands={targetLands}
            setTargetLands={setTargetLands}
            basicsPercent={basicsPercent}
            setBasicsPercent={setBasicsPercent}
            preferColorLands={preferColorLands}
            setPreferColorLands={setPreferColorLands}
            avoidColorlessLands={avoidColorlessLands}
            setAvoidColorlessLands={setAvoidColorlessLands}
            onHover={(card, e) => handleMouseMove(e, card)}
            onMouseLeave={handleMouseLeave}
            generatingDeck={generatingDeck}
            deckGenStatus={deckGenStatus}
          />
          <DeckList
            commander={commander}
            deck={deck}
            onRemove={handleRemoveCard}
            onTag={handleTagCard}
            onAddToMaybeboard={handleAddToMaybeboard}
            mdfcAsLand={mdfcAsLand}
            targetLands={targetLands}
            onHover={(card, e) => handleMouseMove(e, card)}
            onMouseLeave={handleMouseLeave}
          />
          
          {/* Analytics and Visualizations */}
          {showStats && deck.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '1rem' }}>
              <ManaCurveChart deck={deck} commander={commander} />
              <ColorDistribution deck={deck} commander={commander} />
              <DeckStats deck={deck} commander={commander} mdfcAsLand={mdfcAsLand} />
            </div>
          )}
          
          <div className="inline-controls" style={{ marginTop: '0.5rem' }}>
            <button className="btn danger" onClick={handleReset}>
              Reset Deck
            </button>
        </div>
          <SavedDecks onLoad={handleLoadDeck} />
          <ImportDeck onImport={handleImportDeck} />
          {powerLevelAnalysis && <PowerLevel analysis={powerLevelAnalysis} />}
          <Maybeboard
            maybeboard={maybeboard}
            onAddToDeck={handleAddToDeckFromMaybeboard}
            onRemove={handleRemoveFromMaybeboard}
            onHover={(card, e) => handleMouseMove(e, card)}
            onMouseLeave={handleMouseLeave}
          />
          <Playtest
            deck={deck}
            onShuffle={() => {}}
          />
        </>
      )}

      <HoverPreview 
        card={hoverCard} 
        x={hoverPos.x} 
        y={hoverPos.y} 
        onDismiss={handleMouseLeave}
      />
      <KeyboardShortcuts 
        isOpen={showKeyboardHelp} 
        onClose={() => setShowKeyboardHelp(false)} 
      />
      <InstallPrompt />
      <UpdateChecker />
    </div>
  );
}
