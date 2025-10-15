"use client";
import React from 'react';
import { createPortal } from 'react-dom';

type Props = {
  content: string | null;
  anchorRect: DOMRect | null;
  onClose?: () => void;
};

export default function Tooltip({ content, anchorRect }: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [style, setStyle] = React.useState<{ top: number; left: number; visibility: 'hidden' | 'visible' }>({ top: 0, left: 0, visibility: 'hidden' });

  React.useLayoutEffect(() => {
    if (!content || !anchorRect) {
      setStyle(s => ({ ...s, visibility: 'hidden' }));
      return;
    }
    // First set invisible to measure
    setStyle({ top: 0, left: 0, visibility: 'hidden' });
    const timer = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const tipRect = el.getBoundingClientRect();
      const margin = 8;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Prefer top placement
      let top = anchorRect.top - tipRect.height - margin;
      let placeAbove = true;
      if (top < margin) {
        // place below if not enough space above
        top = anchorRect.bottom + margin;
        placeAbove = false;
      }
      // center horizontally over anchor
      let left = anchorRect.left + (anchorRect.width / 2) - (tipRect.width / 2);
      // clamp within viewport
      left = Math.max(margin, Math.min(left, vw - tipRect.width - margin));
      // if placed below and goes off bottom, clamp to bottom margin
      if (!placeAbove && top + tipRect.height + margin > vh) {
        top = Math.max(margin, vh - tipRect.height - margin);
      }
      setStyle({ top, left, visibility: 'visible' });
    });
    return () => cancelAnimationFrame(timer);
  }, [content, anchorRect]);

  if (!content || !anchorRect) return null;
  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: style.top,
        left: style.left,
        zIndex: 10000,
        background: '#1e222b',
        color: '#e6edf3',
        padding: '16px 20px',
        borderRadius: 8,
        whiteSpace: 'pre-line',
        fontSize: 14,
        lineHeight: 1.7,
        minWidth: 280,
        maxWidth: 450,
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        border: '1px solid #2a2f3b',
        pointerEvents: 'none',
        visibility: style.visibility
      }}
    >{content}</div>,
    document.body
  );
}


