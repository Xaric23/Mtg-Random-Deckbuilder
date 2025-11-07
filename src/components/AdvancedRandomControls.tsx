'use client';

import { useState } from 'react';

export interface AdvancedRandomOptions {
  budget?: 'budget' | 'mid' | 'high' | 'any';
  powerLevel?: number; // 1-10
  includeTribal?: boolean;
  includeCombo?: boolean;
  preferCreatures?: boolean;
  maxCMC?: number;
}

interface AdvancedRandomControlsProps {
  onGenerate: (options: AdvancedRandomOptions) => void;
  isGenerating: boolean;
}

export function AdvancedRandomControls({ onGenerate, isGenerating }: AdvancedRandomControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [budget, setBudget] = useState<'budget' | 'mid' | 'high' | 'any'>('any');
  const [powerLevel, setPowerLevel] = useState(5);
  const [includeTribal, setIncludeTribal] = useState(false);
  const [includeCombo, setIncludeCombo] = useState(false);
  const [preferCreatures, setPreferCreatures] = useState(false);
  const [maxCMC, setMaxCMC] = useState(10);

  const handleGenerate = () => {
    onGenerate({
      budget,
      powerLevel,
      includeTribal,
      includeCombo,
      preferCreatures,
      maxCMC,
    });
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <button
        className="btn"
        onClick={() => setShowAdvanced(!showAdvanced)}
        style={{ marginBottom: '0.5rem' }}
      >
        {showAdvanced ? '▼' : '▶'} Advanced Random Options
      </button>

      {showAdvanced && (
        <div
          style={{
            padding: '1rem',
            background: 'var(--bg-secondary, #f5f5f5)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Budget Filter */}
          <div>
            <label className="small" style={{ display: 'block', marginBottom: '0.5rem' }}>
              <strong>Budget Level</strong>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className={`btn ${budget === 'budget' ? 'primary' : ''}`}
                onClick={() => setBudget('budget')}
              >
                Budget (&lt;$100)
              </button>
              <button
                className={`btn ${budget === 'mid' ? 'primary' : ''}`}
                onClick={() => setBudget('mid')}
              >
                Mid ($100-500)
              </button>
              <button
                className={`btn ${budget === 'high' ? 'primary' : ''}`}
                onClick={() => setBudget('high')}
              >
                High ($500+)
              </button>
              <button
                className={`btn ${budget === 'any' ? 'primary' : ''}`}
                onClick={() => setBudget('any')}
              >
                Any
              </button>
            </div>
            <p className="small muted" style={{ marginTop: '0.25rem' }}>
              Filter cards by estimated price range
            </p>
          </div>

          {/* Power Level */}
          <div>
            <label className="small" style={{ display: 'block', marginBottom: '0.5rem' }}>
              <strong>Target Power Level: {powerLevel}/10</strong>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={powerLevel}
              onChange={(e) => setPowerLevel(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
              <span className="small muted">Casual</span>
              <span className="small muted">Competitive</span>
            </div>
          </div>

          {/* Max CMC */}
          <div>
            <label className="small" style={{ display: 'block', marginBottom: '0.5rem' }}>
              <strong>Maximum CMC: {maxCMC === 15 ? '∞' : maxCMC}</strong>
            </label>
            <input
              type="range"
              min="3"
              max="15"
              value={maxCMC}
              onChange={(e) => setMaxCMC(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <p className="small muted" style={{ marginTop: '0.25rem' }}>
              Exclude cards above this mana value
            </p>
          </div>

          {/* Theme Preferences */}
          <div>
            <label className="small" style={{ display: 'block', marginBottom: '0.5rem' }}>
              <strong>Theme Preferences</strong>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={includeTribal}
                  onChange={(e) => setIncludeTribal(e.target.checked)}
                />
                <span className="small">Prefer tribal synergies</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={includeCombo}
                  onChange={(e) => setIncludeCombo(e.target.checked)}
                />
                <span className="small">Include combo pieces</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={preferCreatures}
                  onChange={(e) => setPreferCreatures(e.target.checked)}
                />
                <span className="small">Prefer creature-heavy build</span>
              </label>
            </div>
          </div>

          {/* Generate Button */}
          <button
            className="btn primary"
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{ marginTop: '0.5rem' }}
          >
            {isGenerating ? 'Generating...' : '🎲 Generate with These Options'}
          </button>

          <div className="small muted" style={{ padding: '0.75rem', background: 'var(--bg-primary, #fff)', borderRadius: '4px' }}>
            <strong>Note:</strong> Advanced options use filters to customize your random deck. Some options (like budget) require additional API data and may slow down generation.
          </div>
        </div>
      )}
    </div>
  );
}
