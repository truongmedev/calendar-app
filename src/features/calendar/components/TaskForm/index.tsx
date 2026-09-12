import './style.css';
import { FormEvent, useState } from 'react';
import { CalendarTask } from '../../model/types';
import { formatLongDate, formatTime, parseTime } from '../../model/time';

interface Props {
  task: CalendarTask;
  editing: boolean;
  onSave: (task: CalendarTask) => void;
}

export default function TaskForm({ task, editing, onSave }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [start, setStart] = useState(formatTime(task.startMinute));
  const [end, setEnd] = useState(formatTime(task.endMinute));
  const [error, setError] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const startMinute = editing ? parseTime(start) : task.startMinute;
    const endMinute = editing ? parseTime(end) : task.endMinute;
    if (!(endMinute > startMinute)) {
      setError('Nhập giờ HH:mm hợp lệ, giờ kết thúc phải sau giờ bắt đầu.');
      return;
    }
    if (title.trim()) onSave({ ...task, title: title.trim(), description: description.trim(), startMinute, endMinute });
  };
  return (
    <form onSubmit={submit}>
      <input className="calendar-modal-title" autoFocus required aria-label="Tên task" placeholder="Thêm tiêu đề"
        value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="calendar-modal-row">
        <div className="calendar-modal-label">Thời gian</div>
        <div className="calendar-modal-time">
          <span className="calendar-modal-date">{formatLongDate(task.date)}</span>
          {editing ? <>
            <label>Bắt đầu<input className="calendar-modal-title" value={start} onChange={(e) => setStart(e.target.value)} placeholder="HH:mm" required /></label>
            <label>Kết thúc<input className="calendar-modal-title" value={end} onChange={(e) => setEnd(e.target.value)} placeholder="HH:mm" required /></label>
            {error && <p role="alert">{error}</p>}
          </> : <span>{formatTime(task.startMinute)} – {formatTime(task.endMinute)}</span>}
        </div>
      </div>
      <div className="calendar-modal-row">
        <label className="calendar-modal-label">Mô tả
          <textarea className="calendar-modal-description" rows={4} placeholder="Thêm mô tả"
            value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
      </div>
      <footer className="calendar-modal-actions"><button type="submit" className="calendar-modal-save" disabled={!title.trim()}>Lưu</button></footer>
    </form>
  );
}
