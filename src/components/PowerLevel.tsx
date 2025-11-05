'use client';

import type { PowerLevelAnalysis } from '@/lib/powerLevel';

interface PowerLevelProps {
  analysis: PowerLevelAnalysis;
}

export function PowerLevel({ analysis }: PowerLevelProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'cEDH': return '#d32f2f';
      case 'Optimized': return '#f57c00';
      case 'Upgraded Precon': return '#1976d2';
      case 'Casual': return '#388e3c';
      default: return '#666';
    }
  };

  const getLevelDescription = (level: string) => {
    switch (level) {
      case 'cEDH': return 'Competitive EDH - High-powered combos and tutors';
      case 'Optimized': return 'Optimized - Strong synergies and efficient cards';
      case 'Upgraded Precon': return 'Upgraded Precon - Improved from a precon deck';
      case 'Casual': return 'Casual - Fun-focused, lower power level';
      default: return '';
    }
  };

  return (
    <section style={{ marginTop: '1rem', padding: '1rem', background: 'var(--chip)', borderRadius: '8px' }}>
      <h3>Power Level Assessment</h3>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getLevelColor(analysis.level) }}>
            {analysis.level}
          </span>
          <span className="small muted">Score: {analysis.score}/200</span>
        </div>
        <div className="small muted">{getLevelDescription(analysis.level)}</div>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <h4 className="small" style={{ marginBottom: '0.5rem' }}>Factors</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
          <div className="small">
            <strong>Ramp:</strong> {analysis.factors.ramp}
          </div>
          <div className="small">
            <strong>Draw:</strong> {analysis.factors.draw}
          </div>
          <div className="small">
            <strong>Tutors:</strong> {analysis.factors.tutors}
          </div>
          <div className="small">
            <strong>Interaction:</strong> {analysis.factors.interaction}
          </div>
          <div className="small">
            <strong>Combos:</strong> {analysis.factors.combos}
          </div>
          <div className="small">
            <strong>Avg CMC:</strong> {analysis.factors.averageCMC}
          </div>
        </div>
      </div>
      
      {analysis.combos.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 className="small" style={{ marginBottom: '0.5rem', color: '#d32f2f' }}>Detected Combos</h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {analysis.combos.map((combo, i) => (
              <span key={i} className="badge" style={{ background: '#ffebee', color: '#c62828' }}>
                {combo}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {analysis.warnings.length > 0 && (
        <div>
          <h4 className="small" style={{ marginBottom: '0.5rem', color: '#f57c00' }}>Warnings</h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {analysis.warnings.map((warning, i) => (
              <span key={i} className="badge" style={{ background: '#fff3cd', color: '#8a6d3b' }}>
                {warning}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

