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
  const [topPosition, setTopPosition] = useState('20px');

  useEffect(() => {
    if (card) {
      setImage(normalImage(card));
    } else {
      setImage(null);
    }
  }, [card]);

  useEffect(() => {
    if (typeof window !== 'undefined' && card) {
      const maxTop = window.innerHeight - 650;
      const calculatedTop = Math.max(20, Math.min(y - 300, maxTop));
      setTopPosition(`${calculatedTop}px`);
    }
  }, [y, card]);

  if (!image) return null;

  return (
    <div
      className="img-popover"
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 9999,
        left: '20px',
        top: topPosition,
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

