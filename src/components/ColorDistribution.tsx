'use client';

import { useMemo } from 'react';
import type { Card } from '@/lib/types';
import { pipCounts } from '@/lib/deck';

interface ColorDistributionProps {
  deck: Card[];
  commander: Card | null;
}

export function ColorDistribution({ deck, commander }: ColorDistributionProps) {
  const colorData = useMemo(() => {
    const totals = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    
    deck.forEach(card => {
      const pips = pipCounts(card);
      totals.W += pips.W;
      totals.U += pips.U;
      totals.B += pips.B;
      totals.R += pips.R;
      totals.G += pips.G;
      totals.C += pips.C;
    });
    
    const totalPips = Object.values(totals).reduce((sum, val) => sum + val, 0);
    
    return {
      totals,
      totalPips,
      percentages: {
        W: totalPips > 0 ? (totals.W / totalPips) * 100 : 0,
        U: totalPips > 0 ? (totals.U / totalPips) * 100 : 0,
        B: totalPips > 0 ? (totals.B / totalPips) * 100 : 0,
        R: totalPips > 0 ? (totals.R / totalPips) * 100 : 0,
        G: totalPips > 0 ? (totals.G / totalPips) * 100 : 0,
        C: totalPips > 0 ? (totals.C / totalPips) * 100 : 0,
      },
    };
  }, [deck]);

  const commanderColors = commander?.color_identity || [];

  if (deck.length === 0) {
    return (
      <div className="color-distribution">
        <h3>Color Distribution</h3>
        <p className="small muted">Add cards to see color pip distribution</p>
      </div>
    );
  }

  const colors: Array<{ symbol: string; name: string; color: string; key: keyof typeof colorData.totals }> = [
    { symbol: 'W', name: 'White', color: '#f0e68c', key: 'W' },
    { symbol: 'U', name: 'Blue', color: '#4a9eff', key: 'U' },
    { symbol: 'B', name: 'Black', color: '#8b7355', key: 'B' },
    { symbol: 'R', name: 'Red', color: '#e25822', key: 'R' },
    { symbol: 'G', name: 'Green', color: '#4e9a06', key: 'G' },
    { symbol: 'C', name: 'Colorless', color: '#95a5a6', key: 'C' },
  ];

  return (
    <div className="color-distribution">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Color Distribution</h3>
        <div className="small muted">
          Total Pips: <strong>{colorData.totalPips}</strong>
        </div>
      </div>
      
      {/* Color Pie Visualization */}
      <div 
        style={{
          display: 'flex',
          height: '30px',
          borderRadius: '15px',
          overflow: 'hidden',
          marginBottom: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {colors.map(({ key, color }) => {
          const percentage = colorData.percentages[key];
          if (percentage === 0) return null;
          
          return (
            <div
              key={key}
              style={{
                width: `${percentage}%`,
                background: color,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              title={`${key}: ${colorData.totals[key]} pips (${percentage.toFixed(1)}%)`}
              className="color-segment"
            />
          );
        })}
      </div>
      
      {/* Color Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {colors.map(({ symbol, name, color, key }) => {
          const count = colorData.totals[key];
          const percentage = colorData.percentages[key];
          const inCommander = commanderColors.includes(symbol);
          
          if (count === 0) return null;
          
          return (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                background: inCommander ? 'var(--bg-secondary, #f5f5f5)' : 'transparent',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: color,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="small" style={{ minWidth: '80px' }}>
                  <strong>{symbol}</strong> {name}
                </span>
                <div 
                  style={{
                    flex: 1,
                    height: '8px',
                    background: 'var(--bg-tertiary, #e0e0e0)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: color,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <span className="small muted" style={{ minWidth: '80px', textAlign: 'right' }}>
                  {count} ({percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      <style jsx>{`
        .color-segment:hover {
          filter: brightness(1.1);
        }
      `}</style>
    </div>
  );
}
