'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  // Handle image loading with error handling
  useEffect(() => {
    setError(null);
    if (card) {
      const img = new Image();
      img.onload = () => {
        setImage(normalImage(card));
        setError(null);
      };
      img.onerror = () => {
        setError('Failed to load card image');
        setImage(null);
      };
      const imgUrl = normalImage(card);
      if (imgUrl) {
        img.src = imgUrl;
      } else {
        setError('No image available for this card');
      }
    } else {
      setImage(null);
    }
  }, [card]);

  // Debounced position updates
  useEffect(() => {
    if (typeof window !== 'undefined' && card) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      debounceTimer.current = setTimeout(() => {
        const maxTop = window.innerHeight - 650;
        const calculatedTop = Math.max(20, Math.min(y - 300, maxTop));
        setTopPosition(`${calculatedTop}px`);
      }, 16); // ~1 frame at 60fps
    }
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
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

