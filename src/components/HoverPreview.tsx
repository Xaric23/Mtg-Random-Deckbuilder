'use client';

import { useState, useEffect, useRef } from 'react';
import type { Card } from '@/lib/types';
import { normalImage } from '@/lib/deck';

interface HoverPreviewProps {
  card: Card | null;
  x: number;
  y: number;
  onDismiss?: () => void;
}

export function HoverPreview({ card, y, onDismiss }: HoverPreviewProps) {
  const [image, setImage] = useState<string | null>(null);
  const [topPosition, setTopPosition] = useState('20px');
  const [isTouchDevice] = useState(() => 
    typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  );
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  // Handle image loading with error handling
  useEffect(() => {
    let cancelled = false;

    if (!card) {
      // When card is null, schedule state update to avoid synchronous update during render
      const timer = setTimeout(() => setImage(null), 0);
      return () => clearTimeout(timer);
    }

    const img = new Image();
    const imgUrl = normalImage(card);
    
    if (!imgUrl) {
      const timer = setTimeout(() => setImage(null), 0);
      return () => clearTimeout(timer);
    }
    
    img.onload = () => {
      if (!cancelled) {
        setImage(imgUrl);
      }
    };
    
    img.onerror = () => {
      if (!cancelled) {
        setImage(null);
      }
    };
    
    img.src = imgUrl;

    return () => {
      cancelled = true;
    };
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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <>
      {/* Backdrop for touch devices to dismiss preview */}
      {isTouchDevice && (
        <div
          onClick={handleClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9998,
            background: 'transparent',
          }}
          aria-label="Dismiss card preview"
        />
      )}
      
      <div
        className="img-popover"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Card preview - click to dismiss"
        style={{
          position: 'fixed',
          pointerEvents: isTouchDevice ? 'auto' : 'none',
          zIndex: 9999,
          left: '20px',
          top: topPosition,
          display: image ? 'block' : 'none',
          cursor: isTouchDevice ? 'pointer' : 'default',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
    </>
  );
}

