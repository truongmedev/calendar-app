import './style.css';
import { CalendarTask } from '../../model/types';
import { formatLongDate, formatTime } from '../../model/time';

export default function TaskDetails({ task }: { task: CalendarTask }) {
  return <>
    <div className="calendar-modal-label">Tên task</div>
    <h3 className="calendar-modal-view-title">{task.title || '(Không có tiêu đề)'}</h3>
    <div className="calendar-modal-row">
      <div className="calendar-modal-label">Thời gian</div>
      <div className="calendar-modal-time">
        <span className="calendar-modal-date">{formatLongDate(task.date)}</span>
        <span>{formatTime(task.startMinute)} – {formatTime(task.endMinute)}</span>
      </div>
    </div>
    <div className="calendar-modal-row">
      <div className="calendar-modal-label">Mô tả</div>
      <p className="calendar-modal-view-description">{task.description || 'Không có mô tả'}</p>
    </div>
  </>;
}
