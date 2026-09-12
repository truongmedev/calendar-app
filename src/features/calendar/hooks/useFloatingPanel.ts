import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { clamp } from '../model/time';

export default function useFloatingPanel(anchor: HTMLElement, onClose: () => void, point?: { x: number; y: number }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useLayoutEffect(() => { closeRef.current = onClose; });

  const positionPanel = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const rect = anchor.getBoundingClientRect();
    const { width, height } = panel.getBoundingClientRect();
    const left = point?.x ?? (rect.right + 12 + width <= window.innerWidth - 16 ? rect.right + 12 : rect.left - width - 12);
    panel.style.left = `${clamp(left, 16, Math.max(16, window.innerWidth - width - 16))}px`;
    panel.style.top = `${clamp(point?.y ?? rect.top, 16, Math.max(16, window.innerHeight - height - 16))}px`;
  }, [anchor, point]);
  useLayoutEffect(positionPanel);

  useEffect(() => {
    const outside = (e: PointerEvent) => {
      if (e.target instanceof Node && !panelRef.current?.contains(e.target) && !anchor.contains(e.target)) closeRef.current();
    };
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
    const reposition = () => { if (point) closeRef.current(); else positionPanel(); };
    const observer = new ResizeObserver(positionPanel);
    observer.observe(anchor);
    if (panelRef.current) observer.observe(panelRef.current);
    document.addEventListener('pointerdown', outside, true);
    document.addEventListener('keydown', escape);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      observer.disconnect();
      document.removeEventListener('pointerdown', outside, true);
      document.removeEventListener('keydown', escape);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [anchor, point, positionPanel]);
  return panelRef;
}
