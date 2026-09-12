import { useMemo, useRef } from 'react';
import CalendarGrid from './components/CalendarGrid';
import CalendarLayer from './components/CalendarLayer';
import useMinuteClock from './hooks/useMinuteClock';
import { formatDate, getWeekDays, HOUR_HEIGHT, PIXELS_PER_MINUTE } from './model/time';
import './calendar.css';
import './tasks.css';
import './popup.css';

export default function Calendar() {
  const now = useMinuteClock();
  const today = formatDate(now);
  const days = useMemo(() => getWeekDays(today), [today]);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const minute = now.getHours() * 60 + now.getMinutes();
  return <div ref={scrollerRef} className="calendar-table-container" style={{ '--calendar-hour-height': `${HOUR_HEIGHT}px` } as React.CSSProperties}>
    <div className="calendar-table-content">
      <CalendarGrid days={days} today={today} />
      <div className="calendar-now-layer">
        <div className="calendar-current-time" style={{ top: minute * PIXELS_PER_MINUTE, width: `${100 / days.length}%` }} />
      </div>
      <CalendarLayer days={days} scrollerRef={scrollerRef} />
    </div>
  </div>;
}
