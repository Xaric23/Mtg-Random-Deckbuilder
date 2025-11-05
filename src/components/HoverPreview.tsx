'use client';

import { useState, useEffect } from 'react';
import type { Card } from '@/lib/types';
import { normalImage } from '@/lib/deck';

interface HoverPreviewProps {
  card: Card | null;
  x: number;
  y: number;
}

export function HoverPreview({ card, x, y }: HoverPreviewProps) {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (card) {
      setImage(normalImage(card));
    } else {
      setImage(null);
    }
  }, [card]);

  if (!image) return null;

  // Position on left margin, vertically centered or aligned with cursor
  const getTopPosition = () => {
    if (typeof window === 'undefined') return '20px';
    const maxTop = window.innerHeight - 650;
    return `${Math.max(20, Math.min(y - 300, maxTop))}px`;
  };

  return (
    <div
      className="img-popover"
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 9999,
        left: '20px',
        top: getTopPosition(),
        display: image ? 'block' : 'none',
      }}
    >
      <img 
        src={image} 
        alt="Card preview" 
        style={{ 
          width: '450px', 
          height: 'auto', 
          display: 'block',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
        }} 
      />
    </div>
  );
}

