import { Dispatch, PointerEvent as ReactPointerEvent, RefObject, useCallback, useEffect, useRef } from 'react';
import { CalendarAction } from '../model/state';
import { CalendarTask, DragMode } from '../model/types';
import { changeTaskRange, PIXELS_PER_MINUTE } from '../model/time';

interface DragSession {
  pointerId: number;
  element: HTMLElement;
  scroller: HTMLElement;
  mode: DragMode;
  original: CalendarTask;
  startY: number;
  clientY: number;
  startScroll: number;
  lastDelta: number;
  moved: boolean;
  headerHeight: number;
}

export default function useTaskDrag(scrollerRef: RefObject<HTMLDivElement | null>, dispatch: Dispatch<CalendarAction>) {
  const sessionRef = useRef<DragSession | null>(null);
  const cleanupRef = useRef<() => void>(() => { });

  useEffect(() => () => cleanupRef.current(), []);

  const beginDrag = useCallback((event: ReactPointerEvent<HTMLElement>, task: CalendarTask, mode: DragMode) => {
    event.stopPropagation();
    const scroller = scrollerRef.current;
    if (!scroller || !event.isPrimary || event.button !== 0 || sessionRef.current) return;
    event.preventDefault();
    const session: DragSession = {
      pointerId: event.pointerId, element: event.currentTarget, scroller, mode, original: task,
      startY: event.clientY, clientY: event.clientY, startScroll: scroller.scrollTop,
      lastDelta: 0, moved: false, headerHeight: scroller.querySelector('thead')?.getBoundingClientRect().height ?? 0,
    };
    sessionRef.current = session;
    if (mode === 'create') dispatch({ type: 'begin', task });
    session.element.setPointerCapture(event.pointerId);
    let frame = 0;
    let lastFrame = performance.now();

    const update = () => {
      const delta = Math.round((session.clientY - session.startY + scroller.scrollTop - session.startScroll) / PIXELS_PER_MINUTE);
      if (!session.moved && Math.abs(delta) < 3) return session.original;
      session.moved = true;
      const updated = changeTaskRange(session.original, mode, delta);
      if (delta !== session.lastDelta) dispatch({ type: 'change', task: updated });
      session.lastDelta = delta;
      return updated;
    };

    const finish = (cancelled: boolean) => {
      if (!sessionRef.current) return;
      const updated = update();
      cleanupRef.current();
      if (cancelled) {
        dispatch(mode === 'create' ? { type: 'close' } : { type: 'change', task: session.original });
      } else if (mode === 'create') {
        const anchor = session.element.querySelector<HTMLElement>('[data-draft]');
        if (session.moved && updated.endMinute > updated.startMinute && anchor) {
          dispatch({ type: 'open', popup: { mode: 'create', taskId: task.id, anchor } });
        } else dispatch({ type: 'close' });
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== session.pointerId) return;
      session.clientY = e.clientY;
      if ((e.buttons & 1) === 0) finish(true);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== session.pointerId) return;
      session.clientY = e.clientY;
      finish(false);
    };
    const onCancel = (e: PointerEvent) => { if (e.pointerId === session.pointerId) finish(true); };
    const onBlur = () => finish(true);
    const tick = (now: number) => {
      const elapsed = Math.min(now - lastFrame, 32);
      lastFrame = now;
      const rect = scroller.getBoundingClientRect();
      const top = Math.max(0, rect.top + session.headerHeight);
      const bottom = Math.min(window.innerHeight, rect.bottom);
      const direction = session.clientY > bottom - 40 ? 1 : session.clientY < top + 40 ? -1 : 0;
      if (session.moved || Math.abs(session.clientY - session.startY) >= 3) {
        scroller.scrollTop += direction * 360 * elapsed / 1000;
      }
      update();
      frame = requestAnimationFrame(tick);
    };

    cleanupRef.current = () => {
      sessionRef.current = null;
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('blur', onBlur);
      session.element.removeEventListener('lostpointercapture', onCancel);
      if (session.element.hasPointerCapture(session.pointerId)) session.element.releasePointerCapture(session.pointerId);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('blur', onBlur);
    session.element.addEventListener('lostpointercapture', onCancel);
    frame = requestAnimationFrame(tick);
  }, [dispatch, scrollerRef]);

  return beginDrag;
}
