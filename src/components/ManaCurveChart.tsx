'use client';

import { useMemo } from 'react';
import type { Card } from '@/lib/types';
import { manaValue } from '@/lib/deck';

interface ManaCurveChartProps {
  deck: Card[];
  commander: Card | null;
}

export function ManaCurveChart({ deck, commander }: ManaCurveChartProps) {
  const curveData = useMemo(() => {
    const counts = new Map<number, number>();
    
    // Count cards by CMC
    deck.forEach(card => {
      const cmc = manaValue(card);
      counts.set(cmc, (counts.get(cmc) || 0) + 1);
    });
    
    // Build array from 0-10+ CMC
    const data: { cmc: number; count: number; percentage: number }[] = [];
    const totalCards = deck.length;
    
    for (let i = 0; i <= 10; i++) {
      const count = counts.get(i) || 0;
      data.push({
        cmc: i,
        count,
        percentage: totalCards > 0 ? (count / totalCards) * 100 : 0,
      });
    }
    
    // Add 10+ bucket
    let tenPlus = 0;
    counts.forEach((count, cmc) => {
      if (cmc > 10) tenPlus += count;
    });
    if (tenPlus > 0) {
      data.push({
        cmc: 11,
        count: tenPlus,
        percentage: totalCards > 0 ? (tenPlus / totalCards) * 100 : 0,
      });
    }
    
    return data;
  }, [deck]);

  const maxCount = useMemo(() => {
    return Math.max(...curveData.map(d => d.count), 1);
  }, [curveData]);

  const avgCMC = useMemo(() => {
    if (deck.length === 0) return 0;
    const total = deck.reduce((sum, card) => sum + manaValue(card), 0);
    return (total / deck.length).toFixed(2);
  }, [deck]);

  if (deck.length === 0) {
    return (
      <div className="mana-curve-chart">
        <h3>Mana Curve</h3>
        <p className="small muted">Add cards to see mana curve visualization</p>
      </div>
    );
  }

  return (
    <div className="mana-curve-chart">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Mana Curve</h3>
        <div className="small muted">
          Avg CMC: <strong>{avgCMC}</strong>
          {commander && (
            <> | Commander: <strong>{manaValue(commander)}</strong></>
          )}
        </div>
      </div>
      
      <div 
        className="curve-bars"
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'flex-end',
          height: '200px',
          padding: '0.5rem',
          borderRadius: '8px',
          background: 'var(--bg-secondary, #f5f5f5)',
        }}
      >
        {curveData.map(({ cmc, count, percentage }) => {
          const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const label = cmc === 11 ? '10+' : cmc.toString();
          
          return (
            <div
              key={cmc}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
              title={`${count} card${count !== 1 ? 's' : ''} at CMC ${label} (${percentage.toFixed(1)}%)`}
            >
              <div
                style={{
                  width: '100%',
                  height: `${heightPercent}%`,
                  minHeight: count > 0 ? '8px' : '0',
                  background: getCMCColor(cmc),
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingTop: count > 0 ? '4px' : '0',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  color: cmc >= 6 ? '#fff' : 'var(--text-color, #333)',
                }}
                className="curve-bar"
              >
                {count > 0 && count}
              </div>
              <div className="small muted" style={{ fontSize: '0.7rem' }}>
                {label}
              </div>
            </div>
          );
        })}
      </div>
      
      <style jsx>{`
        .curve-bar:hover {
          opacity: 0.8;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}

function getCMCColor(cmc: number): string {
  if (cmc === 0) return '#d4d4d4';
  if (cmc === 1) return '#a3d977';
  if (cmc === 2) return '#7ec850';
  if (cmc === 3) return '#4ea832';
  if (cmc === 4) return '#f4c542';
  if (cmc === 5) return '#f39c12';
  if (cmc === 6) return '#e67e22';
  if (cmc >= 7) return '#c0392b';
  return '#95a5a6';
}
