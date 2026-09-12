import './style.css';
import { memo } from 'react';
import { CalendarDay } from '../../model/types';
import { formatTime } from '../../model/time';

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

function CalendarGrid({ days, today }: { days: CalendarDay[]; today: string }) {
  return <table className="calendar-table">
    <colgroup><col className="calendar-time-column" />{days.map((day) => <col key={day.date} />)}</colgroup>
    <thead><tr>
      <th className="calendar-timezone">GMT+07</th>
      {days.map((day) => <th key={day.date} className={`calendar-day${day.date === today ? ' calendar-day--today' : ''}`}>
        <span className="calendar-weekday">{day.weekday}</span>
        <span className="calendar-date">{day.dayOfMonth}</span>
      </th>)}
    </tr></thead>
    <tbody>{HOURS.map((hour) => <tr key={hour}>
      <th className="calendar-hour"><span>{hour ? formatTime(hour * 60) : ''}</span></th>
      {days.map((day) => <td key={day.date} className="calendar-slot" />)}
    </tr>)}</tbody>
  </table>;
}

export default memo(CalendarGrid);
