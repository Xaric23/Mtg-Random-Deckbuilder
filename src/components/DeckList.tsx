'use client';

import type { Card } from '@/lib/types';
import {
  cardName,
  manaCost,
  manaValue,
  pipCounts,
  isLand,
  countByTypeLine,
} from '@/lib/deck';
import { makeStandardExport, makeMTGO, makeArena, makeMoxfield, makeArchidekt, makeMoxfieldWithTags, copyToClipboard } from '@/lib/export';
import { isBanned } from '@/lib/import';

interface DeckListProps {
  commander: Card | null;
  deck: Card[];
  onRemove: (cardId: string) => void;
  onTag: (cardId: string, tag: 'Ramp' | 'Draw' | 'Removal' | '') => void;
  onAddToMaybeboard?: (card: Card) => void;
  mdfcAsLand: boolean;
  targetLands: number;
  onHover?: (card: Card | null, e: React.MouseEvent) => void;
  onMouseLeave?: () => void;
}

export function DeckList({ commander, deck, onRemove, onTag, onAddToMaybeboard, mdfcAsLand, onHover, onMouseLeave }: DeckListProps) {

  const nonlands = deck.filter(c => !isLand(c, mdfcAsLand));
  const lands = deck.filter(c => isLand(c, mdfcAsLand));
  const ordered = [...nonlands, ...lands];
  const counts = countByTypeLine(deck);

  // Analytics
  const mvBuckets = [0, 1, 2, 3, 4, 5, 6];
  const curve: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const pipTotal = { W: 0, U: 0, B: 0, R: 0, G: 0 };
  for (const c of nonlands) {
    const mv = Math.min(6, Math.floor(manaValue(c)));
    curve[mv]++;
    const pc = pipCounts(c);
    for (const k of Object.keys(pipTotal) as Array<keyof typeof pipTotal>) pipTotal[k] += pc[k] || 0;
  }
  const curveStr = `Curve: ${mvBuckets.map(k => `${k}${k === 6 ? '+' : ''}:${curve[k]}`).join(' | ')}`;
  const pipStr = `Pips W:${pipTotal.W} U:${pipTotal.U} B:${pipTotal.B} R:${pipTotal.R} G:${pipTotal.G}`;

  // Heuristics
  const bigDrops = nonlands.filter(c => manaValue(c) >= 6).length;
  const rampCount = deck.filter(c => c._tag === 'Ramp').length;
  const drawCount = deck.filter(c => c._tag === 'Draw').length;
  const warn: string[] = [];
  if (bigDrops > 12) warn.push('Many 6+ drops');
  if (rampCount < 8) warn.push('Low ramp');
  if (drawCount < 8) warn.push('Low draw');
  if (lands.length < 32) warn.push('Low land count');

  const exportText = makeStandardExport(commander, deck, mdfcAsLand);

  const handleCopy = async () => {
    await copyToClipboard(exportText);
    alert('Decklist copied to clipboard.');
  };

  const handleExportMTGO = async () => {
    await copyToClipboard(makeMTGO(deck, mdfcAsLand));
    alert('MTGO decklist copied to clipboard.');
  };

  const handleExportArena = async () => {
    await copyToClipboard(makeArena(commander, deck, mdfcAsLand));
    alert('Arena decklist copied to clipboard.');
  };

  const handleExportMoxfield = async () => {
    await copyToClipboard(makeMoxfield(commander, deck, mdfcAsLand));
    alert('Moxfield decklist copied to clipboard.');
  };

  const handleExportArchidekt = async () => {
    await copyToClipboard(makeArchidekt(commander, deck, mdfcAsLand));
    alert('Archidekt decklist copied to clipboard.');
  };

  const handleExportMoxfieldWithTags = async () => {
    await copyToClipboard(makeMoxfieldWithTags(commander, deck, mdfcAsLand));
    alert('Moxfield decklist with tags copied to clipboard.');
  };

  if (!commander) return null;

  return (
    <section>
      <h2>
        Deck List (<span>{deck.length}</span> cards)
      </h2>
      <div className="line">
        <div>
          <strong>Commander:</strong> <span>{cardName(commander)}</span>{' '}
          <span dangerouslySetInnerHTML={{ __html: commander.color_identity?.map(c => `<span class="pill">${c}</span>`).join(' ') || '' }} />
        </div>
        <div className="small muted">
          Tip: Press <span className="kbd">Enter</span> to search • Hover a card to preview
        </div>
      </div>
      
      {/* Card Grid Layout */}
      <div className="card-grid">
        {ordered.map((c) => {
          const legal = c?.legalities?.commander === 'legal' ? <span className="badge">EDH</span> : null;
          const tag = c._tag ? <span className="badge">{c._tag}</span> : null;
          const banned = isBanned(c.name) ? <span className="badge" style={{ background: '#f8d7da', color: '#721c24', borderColor: '#f5c6cb' }}>BANNED</span> : null;
          return (
            <div
              key={c.id}
              className="card-box"
              onMouseMove={(e) => onHover?.(c, e)}
              onMouseLeave={onMouseLeave}
            >
              <div className="card-box-header">
                <span className="card-box-name">{cardName(c)}</span>
                {manaCost(c) && <span className="card-box-cost">{manaCost(c)}</span>}
              </div>
              <div className="card-box-type small muted">{c.type_line || ''}</div>
              <div className="card-box-badges">
                {legal} {tag} {banned}
              </div>
              <div className="card-box-actions">
                <select className="btn small-btn" onChange={(e) => onTag(c.id, e.target.value as 'Ramp' | 'Draw' | 'Removal' | '')} defaultValue="">
                  <option value="">Tag</option>
                  <option value="Ramp">Ramp</option>
                  <option value="Draw">Draw</option>
                  <option value="Removal">Removal</option>
                </select>
                {onAddToMaybeboard && (
                  <button className="btn small-btn" onClick={() => onAddToMaybeboard(c)}>
                    Maybe
                  </button>
                )}
                <button className="btn small-btn danger" onClick={() => onRemove(c.id)}>
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="small" style={{ margin: '1rem 0', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <span>{curveStr}</span> <span>{pipStr}</span>
        {warn.length > 0 && (
          <span className="badge" style={{ background: '#fff3cd', color: '#8a6d3b', borderColor: '#ffecb5' }}>
            {warn.join(', ')}
          </span>
        )}
      </div>
      <div className="small" style={{ marginBottom: '1rem' }}>
        <span className="badge">Creatures: {counts.creature}</span>
        <span className="badge">Instants: {counts.instant}</span>
        <span className="badge">Sorceries: {counts.sorcery}</span>
        <span className="badge">Artifacts: {counts.artifact}</span>
        <span className="badge">Enchantments: {counts.enchantment}</span>
        <span className="badge">Planeswalkers: {counts.planeswalker}</span>
        <span className="badge">Lands: {counts.land}</span>
      </div>
      
      <details>
        <summary style={{ cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Export Decklist
        </summary>
        <textarea rows={15} value={exportText} readOnly style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '0.5rem' }} />
        <div className="inline-controls">
          <button className="btn" onClick={handleCopy}>
            Copy
          </button>
          <button className="btn" onClick={handleExportMTGO}>
            Copy MTGO
          </button>
          <button className="btn" onClick={handleExportArena}>
            Copy Arena
          </button>
          <button className="btn" onClick={handleExportMoxfield}>
            Copy Moxfield
          </button>
          <button className="btn" onClick={handleExportMoxfieldWithTags}>
            Copy Moxfield (Tags)
          </button>
          <button className="btn" onClick={handleExportArchidekt}>
            Copy Archidekt
          </button>
        </div>
      </details>
    </section>
  );
}

