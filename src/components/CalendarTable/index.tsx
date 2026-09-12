import React from 'react'
import { getDate, getNext7Days, getTimeLabel, getTimeLabelFromNumbers } from '../../utils';
import './style.css';

interface CalendarTableProps {
  currentDate: string;
  currentTime: Date;
}

const CalendarTable: React.FC<CalendarTableProps> = React.memo((props) => {
  const { currentDate, currentTime } = props;
  const next7Days = currentDate ? getNext7Days(currentDate) : [];
  const currentHour = currentTime.getHours();
  const minuteOffset = currentTime.getMinutes();

  return (
    <div className="calendar-table-container">
      <table className="calendar-table">
        <colgroup>
          <col className="calendar-time-column" />
          {next7Days.map((day) => <col key={day.date} />)}
        </colgroup>
        <thead>
          <tr>
            <th className="calendar-timezone">GMT+07</th>
            {next7Days.map((day) => (
              <th key={day.date} className={`calendar-day${day.date === currentDate ? ' calendar-day--today' : ''}`}>
                <span className="calendar-weekday">{day.dayOfWeek}</span>
                <span className="calendar-date">{Number(day.date.split('/')[0])}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 24 }, (_, hour) => (
            <tr key={hour}>
              <th className="calendar-hour">
                <span>{hour === 0 ? '' : getTimeLabelFromNumbers(hour)}</span>
              </th>
              {next7Days.map((day) => (
                <td key={day.date} className="calendar-slot">
                  {day.date === currentDate && hour === currentHour && (
                    <div
                      className="calendar-current-time"
                      style={{ top: `${minuteOffset}px` }}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})

export default CalendarTable
