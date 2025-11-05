'use client';

import { useState, useEffect } from 'react';
import type { Card } from '@/lib/types';
import { smallImage } from '@/lib/deck';

interface HoverPreviewProps {
  card: Card | null;
  x: number;
  y: number;
}

export function HoverPreview({ card, x, y }: HoverPreviewProps) {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (card) {
      setImage(smallImage(card));
    } else {
      setImage(null);
    }
  }, [card]);

  if (!image) return null;

  return (
    <div
      className="img-popover"
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 9999,
        left: `${x + 16}px`,
        top: `${y + 16}px`,
        display: image ? 'block' : 'none',
      }}
    >
      <img src={image} alt="Card preview" style={{ maxWidth: '320px', height: 'auto', display: 'block' }} />
    </div>
  );
}

