'use client';

import { useMemo } from 'react';
import type { Card } from '@/lib/types';
import { manaValue, isLand, pipCounts } from '@/lib/deck';

interface DeckStatsProps {
  deck: Card[];
  commander: Card | null;
  mdfcAsLand: boolean;
}

export function DeckStats({ deck, commander, mdfcAsLand }: DeckStatsProps) {
  const stats = useMemo(() => {
    const lands = deck.filter(c => isLand(c, mdfcAsLand));
    const nonlands = deck.filter(c => !isLand(c, mdfcAsLand));
    
    // Type counts
    const creatures = deck.filter(c => c.type_line?.toLowerCase().includes('creature')).length;
    const instants = deck.filter(c => c.type_line?.toLowerCase().includes('instant')).length;
    const sorceries = deck.filter(c => c.type_line?.toLowerCase().includes('sorcery')).length;
    const artifacts = deck.filter(c => c.type_line?.toLowerCase().includes('artifact')).length;
    const enchantments = deck.filter(c => c.type_line?.toLowerCase().includes('enchantment')).length;
    const planeswalkers = deck.filter(c => c.type_line?.toLowerCase().includes('planeswalker')).length;
    
    // Tagged cards
    const ramp = deck.filter(c => c._tag === 'Ramp').length;
    const draw = deck.filter(c => c._tag === 'Draw').length;
    const removal = deck.filter(c => c._tag === 'Removal').length;
    
    // CMC stats
    const cmcValues = nonlands.map(c => manaValue(c));
    const avgCMC = cmcValues.length > 0 
      ? (cmcValues.reduce((sum, cmc) => sum + cmc, 0) / cmcValues.length).toFixed(2)
      : '0.00';
    const medianCMC = cmcValues.length > 0
      ? cmcValues.sort((a, b) => a - b)[Math.floor(cmcValues.length / 2)]
      : 0;
    
    // Color devotion
    const colorPips = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    deck.forEach(card => {
      const pips = pipCounts(card);
      colorPips.W += pips.W;
      colorPips.U += pips.U;
      colorPips.B += pips.B;
      colorPips.R += pips.R;
      colorPips.G += pips.G;
      colorPips.C += pips.C;
    });
    
    const totalColorPips = colorPips.W + colorPips.U + colorPips.B + colorPips.R + colorPips.G;
    
    return {
      total: deck.length,
      lands: lands.length,
      nonlands: nonlands.length,
      creatures,
      instants,
      sorceries,
      artifacts,
      enchantments,
      planeswalkers,
      ramp,
      draw,
      removal,
      avgCMC,
      medianCMC,
      colorPips,
      totalColorPips,
    };
  }, [deck, mdfcAsLand]);

  const insights = useMemo(() => {
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // Land count check
    if (stats.lands < 30 && stats.total >= 50) {
      warnings.push('⚠️ Low land count - consider 33-40 lands');
    } else if (stats.lands < 33 && stats.total >= 90) {
      suggestions.push('💡 Most Commander decks run 33-37 lands');
    }
    
    // Ramp check
    if (stats.ramp < 8 && stats.total >= 50) {
      warnings.push('⚠️ Low ramp count - consider 8-12 ramp sources');
    }
    
    // Draw check
    if (stats.draw < 8 && stats.total >= 50) {
      warnings.push('⚠️ Low card draw - consider 8-12 draw sources');
    }
    
    // Removal check
    if (stats.removal < 5 && stats.total >= 50) {
      suggestions.push('💡 Consider 5-10 removal spells');
    }
    
    // CMC check
    if (parseFloat(stats.avgCMC) > 4.0) {
      warnings.push('⚠️ High average CMC - may be slow to deploy');
    } else if (parseFloat(stats.avgCMC) < 2.5 && stats.total >= 50) {
      suggestions.push('💡 Low CMC - fast aggressive deck');
    }
    
    // Creature density
    const creaturePercent = stats.total > 0 ? (stats.creatures / stats.total) * 100 : 0;
    if (creaturePercent < 20 && stats.total >= 50) {
      suggestions.push('💡 Low creature count - control/combo deck?');
    } else if (creaturePercent > 50) {
      suggestions.push('💡 High creature density - tribal/aggro build');
    }
    
    return { warnings, suggestions };
  }, [stats]);

  if (deck.length === 0) {
    return (
      <div className="deck-stats">
        <h3>Deck Statistics</h3>
        <p className="small muted">Add cards to see detailed statistics</p>
      </div>
    );
  }

  return (
    <div className="deck-stats">
      <h3>Deck Statistics</h3>
      
      {/* Overview */}
      <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-secondary, #f5f5f5)', borderRadius: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
          <StatItem label="Total Cards" value={stats.total} target={commander ? 100 : 60} />
          <StatItem label="Lands" value={stats.lands} />
          <StatItem label="Nonlands" value={stats.nonlands} />
          <StatItem label="Avg CMC" value={stats.avgCMC} />
        </div>
      </div>
      
      {/* Card Types */}
      <div style={{ marginBottom: '1rem' }}>
        <h4 className="small" style={{ marginBottom: '0.5rem' }}>Card Types</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          <TypeBar label="Creatures" count={stats.creatures} total={stats.total} color="#4ea832" />
          <TypeBar label="Instants" count={stats.instants} total={stats.total} color="#4a9eff" />
          <TypeBar label="Sorceries" count={stats.sorceries} total={stats.total} color="#8b7355" />
          <TypeBar label="Artifacts" count={stats.artifacts} total={stats.total} color="#95a5a6" />
          <TypeBar label="Enchantments" count={stats.enchantments} total={stats.total} color="#f39c12" />
          <TypeBar label="Planeswalkers" count={stats.planeswalkers} total={stats.total} color="#e25822" />
        </div>
      </div>
      
      {/* Tagged Cards */}
      <div style={{ marginBottom: '1rem' }}>
        <h4 className="small" style={{ marginBottom: '0.5rem' }}>Tagged Cards</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          <TaggedCard label="Ramp" count={stats.ramp} emoji="🚀" />
          <TaggedCard label="Draw" count={stats.draw} emoji="📖" />
          <TaggedCard label="Removal" count={stats.removal} emoji="💥" />
        </div>
      </div>
      
      {/* Insights */}
      {(insights.warnings.length > 0 || insights.suggestions.length > 0) && (
        <div style={{ marginTop: '1rem' }}>
          <h4 className="small" style={{ marginBottom: '0.5rem' }}>Insights</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {insights.warnings.map((warning, i) => (
              <div key={`w-${i}`} className="small" style={{ padding: '0.5rem', background: '#fff3cd', borderRadius: '4px' }}>
                {warning}
              </div>
            ))}
            {insights.suggestions.map((suggestion, i) => (
              <div key={`s-${i}`} className="small muted" style={{ padding: '0.5rem', background: 'var(--bg-secondary, #f5f5f5)', borderRadius: '4px' }}>
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value, target }: { label: string; value: number | string; target?: number }) {
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  const isTarget = target !== undefined;
  const meetsTarget = isTarget && numValue >= target;
  
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="small muted">{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isTarget && !meetsTarget ? '#e67e22' : 'inherit' }}>
        {value}
        {target && <span className="small muted">/{target}</span>}
      </div>
    </div>
  );
}

function TypeBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span className="small" style={{ minWidth: '90px' }}>{label}</span>
      <div style={{ flex: 1, height: '8px', background: 'var(--bg-tertiary, #e0e0e0)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${percentage}%`, height: '100%', background: color, transition: 'width 0.3s ease' }} />
      </div>
      <span className="small muted" style={{ minWidth: '60px', textAlign: 'right' }}>
        {count} ({percentage.toFixed(0)}%)
      </span>
    </div>
  );
}

function TaggedCard({ label, count, emoji }: { label: string; count: number; emoji: string }) {
  return (
    <div style={{ padding: '0.5rem', background: 'var(--bg-secondary, #f5f5f5)', borderRadius: '4px', textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem' }}>{emoji}</div>
      <div className="small muted">{label}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{count}</div>
    </div>
  );
}
