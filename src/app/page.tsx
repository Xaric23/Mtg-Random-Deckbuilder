'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Card, SavedDeck } from '@/lib/types';
import { CommanderSearch } from '@/components/CommanderSearch';
import { CardSearch } from '@/components/CardSearch';
import { DeckList } from '@/components/DeckList';
import { SavedDecks } from '@/components/SavedDecks';
import { HoverPreview } from '@/components/HoverPreview';
import { InstallPrompt } from '@/components/InstallPrompt';
import { UpdateChecker } from '@/components/UpdateChecker';
import {
  fetchCardById,
  fetchNamedCard,
  getRandomCard,
} from '@/lib/scryfall';
import {
  isLand,
  isBasicLand,
  isDuplicateInDeck,
  isColorlessOnly,
  producesCommanderColors,
  getBasicLandNamesForCI,
  desiredBasicDistribution,
  suggestLandCycles,
  smallImage,
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

  // Load state on mount (client-side only)
  useEffect(() => {
    setMounted(true);
    const saved = getDarkMode();
    setDarkModeState(saved);
    if (saved && typeof document !== 'undefined') {
      document.body.classList.add('dark');
    }

    // Load deck state
    if (typeof window !== 'undefined') {
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
            const loadDeck = async () => {
              const cards: Card[] = [];
              for (let i = 0; i < parsed.deckIds.length; i += 20) {
                const chunk = parsed.deckIds.slice(i, i + 20);
                const fetched = await Promise.all(chunk.map((id: string) => fetchCardById(id)));
                cards.push(...fetched.filter(Boolean) as Card[]);
                await sleep(80);
              }
              setDeck(cards);
            };
            loadDeck();
          }
        } catch {}
      }
    }
  }, []);

  // Save state whenever deck/commander changes (only after mount)
  useEffect(() => {
    if (mounted) {
      saveState(commander, deck);
    }
  }, [commander, deck, mounted]);

  // Dark mode toggle
  const toggleDarkMode = useCallback(() => {
    const newMode = !darkMode;
    setDarkModeState(newMode);
    setDarkMode(newMode);
    if (newMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
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
    if (saved.commanderId) {
      const c = await fetchCardById(saved.commanderId);
      if (c) setCommander(c);
    }
    setDeck([]);
    if (Array.isArray(saved.deckIds) && saved.deckIds.length) {
      const cards: Card[] = [];
      for (let i = 0; i < saved.deckIds.length; i += 20) {
        const chunk = saved.deckIds.slice(i, i + 20);
        const fetched = await Promise.all(chunk.map((id: string) => fetchCardById(id)));
        cards.push(...fetched.filter(Boolean) as Card[]);
        await sleep(50);
      }
      setDeck(cards);
    }
  }, []);

  const handleReset = useCallback(() => {
    setCommander(null);
    setDeck([]);
    localStorage.removeItem('edh_builder_state');
  }, []);

  const handleGenerateRandomDeck = useCallback(async () => {
    if (!commander) return;
    setDeck([]);
    const target = Math.max(32, Math.min(60, targetLands));
    const basicsPct = Math.max(0, Math.min(100, basicsPercent));

    // Add nonlands first
    const ci = commander.color_identity || [];
    const nonlands: Card[] = [];
    let added = 0;
    for (let guard = 0; guard < (99 - target) * 6 && added < (99 - target); guard++) {
      const c = await getRandomCard(ci, '-t:land');
      if (c && !isDuplicateInDeck(c, nonlands)) {
        nonlands.push(c);
        added++;
      }
      await sleep(40);
    }
    setDeck(nonlands);

    // Add lands
    const desiredBasics = Math.round(target * (basicsPct / 100));
    const basics = getBasicLandNamesForCI(ci.join(''));
    const newDeck = [...nonlands];
    let basicsAdded = 0;
    while (basicsAdded < desiredBasics) {
      const name = basics[Math.floor(Math.random() * basics.length)];
      const card = await fetchNamedCard(name);
      if (card) {
        newDeck.push(card);
        basicsAdded++;
      }
      await sleep(20);
    }
    setDeck(newDeck);

    // Add color-producing nonbasic lands
    let need = target - desiredBasics;
    const finalDeck = [...newDeck];
    while (need > 0) {
      const c = await getRandomCard(ci, 't:land -type:basic');
      if (c) {
        if (preferColorLands && !producesCommanderColors(c, ci)) continue;
        if (avoidColorlessLands && isColorlessOnly(c)) continue;
        if (!isDuplicateInDeck(c, finalDeck)) {
          finalDeck.push(c);
          need--;
        }
      }
      await sleep(35);
    }
    setDeck(finalDeck);
  }, [commander, targetLands, basicsPercent, preferColorLands, avoidColorlessLands]);

  const handleMouseMove = useCallback((e: React.MouseEvent, card: Card | null) => {
    setHoverCard(card);
    setHoverPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverCard(null);
  }, []);

  return (
    <div className="container">
      <h1>MTG Commander Deck Builder</h1>

      <div className="small muted" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label>
          <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} /> Dark mode
        </label>
        <button className="btn" onClick={handleSaveDeck}>
          Save Deck
        </button>
      </div>

      <CommanderSearch
        onSelect={handleSelectCommander}
        onHover={(card, e) => handleMouseMove(e, card)}
        onMouseLeave={handleMouseLeave}
      />

      {commander && (
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
          />
          <DeckList
            commander={commander}
            deck={deck}
            onRemove={handleRemoveCard}
            onTag={handleTagCard}
            mdfcAsLand={mdfcAsLand}
            targetLands={targetLands}
            onHover={(card, e) => handleMouseMove(e, card)}
            onMouseLeave={handleMouseLeave}
          />
          <div className="inline-controls" style={{ marginTop: '0.5rem' }}>
            <button className="btn danger" onClick={handleReset}>
              Reset Deck
            </button>
        </div>
          <SavedDecks onLoad={handleLoadDeck} />
        </>
      )}

      <HoverPreview card={hoverCard} x={hoverPos.x} y={hoverPos.y} />
      <InstallPrompt />
      <UpdateChecker />
    </div>
  );
}
