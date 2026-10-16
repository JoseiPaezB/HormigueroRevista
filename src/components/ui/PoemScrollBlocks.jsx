import React, { useEffect, useRef, useState } from 'react';
import './PoemScrollBlocks.css';

// Solo una línea que contiene exactamente @@@ abre o cierra un bloque.
// Los bloques sin cierre se presentan como texto normal, sin perder contenido.
export function splitPoemScrollBlocks(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const parts = [];
  let buffer = [];
  let marked = false;
  const flush = (animated) => {
    if (buffer.length) parts.push({ text: buffer.join('\n'), animated });
    buffer = [];
  };
  for (const line of lines) {
    if (line.trim() === '@@@') {
      if (marked) {
        flush(true);
        marked = false;
      } else {
        flush(false);
        marked = true;
      }
    } else {
      buffer.push(line);
    }
  }
  // Si falta el cierre, no escondemos accidentalmente el final del poema.
  flush(false);
  return parts;
}

function VisibleBlock({ children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(true);
  const [observed, setObserved] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      setObserved(true);
    }, { rootMargin: '-20% 0px -20% 0px', threshold: 0 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`poem-scroll-block${observed && !visible ? ' poem-scroll-block--hidden' : ''}`}>
    {children}
  </div>;
}

export default function PoemScrollBlocks({ text, renderText }) {
  return <div style={{ whiteSpace: 'pre-wrap' }}>
    {splitPoemScrollBlocks(text).map((part, index) => part.animated
      ? <VisibleBlock key={index}>{renderText(part.text)}</VisibleBlock>
      : <React.Fragment key={index}>{renderText(part.text)}</React.Fragment>
    )}
  </div>;
}
