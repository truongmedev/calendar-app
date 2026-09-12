import { memo, PointerEvent } from 'react';
import { CalendarTask, DragMode, TaskPopup } from '../model/types';
import { formatTime, PIXELS_PER_MINUTE } from '../model/time';

interface Props {
  task: CalendarTask;
  column: number;
  columns: number;
  conflict: boolean;
  selected: boolean;
  draft: boolean;
  beginDrag: (event: PointerEvent<HTMLElement>, task: CalendarTask, mode: DragMode) => void;
  openPopup: (popup: TaskPopup) => void;
}

function TaskCard({ task, column, columns, conflict, selected, draft, beginDrag, openPopup }: Props) {
  const timeLabel = `${formatTime(task.startMinute)} – ${formatTime(task.endMinute)}`;
  const className = ['calendar-task', selected && 'calendar-task--selected', conflict && 'calendar-task--conflict', draft && 'calendar-task--draft'].filter(Boolean).join(' ');
  return (
    <div className={className} data-draft={draft ? '' : undefined}
      role={draft ? undefined : 'button'} tabIndex={draft ? undefined : 0}
      aria-pressed={draft ? undefined : selected}
      title={`${task.title || '(Không có tiêu đề)'} · ${timeLabel}`}
      style={{
        top: task.startMinute * PIXELS_PER_MINUTE, height: Math.max(1, task.endMinute - task.startMinute) * PIXELS_PER_MINUTE,
        left: `${column / columns * 100}%`, width: `calc(${100 / columns}% - 6px)`
      }}
      onPointerDown={(e) => { e.stopPropagation(); if (selected) beginDrag(e, task, 'move'); }}
      onClick={(e) => {
        if (!draft && !selected) openPopup({ mode: 'view', taskId: task.id, anchor: e.currentTarget });
      }}
      onKeyDown={(e) => {
        if (!draft && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          openPopup({ mode: 'view', taskId: task.id, anchor: e.currentTarget });
        }
      }}
      onContextMenu={(e) => {
        if (draft) return;
        e.preventDefault();
        e.stopPropagation();
        openPopup({ mode: 'menu', taskId: task.id, anchor: e.currentTarget, point: { x: e.clientX, y: e.clientY } });
      }}>
      {task.title && <div className="calendar-task-title">{task.title}</div>}
      <div className="calendar-task-time">{timeLabel}</div>
      {selected && (['start', 'end'] as const).map((edge) => (
        <div key={edge} className={`calendar-resize-handle calendar-resize-handle--${edge}`}
          title={edge === 'start' ? 'Kéo để đổi giờ bắt đầu' : 'Kéo để đổi giờ kết thúc'}
          onPointerDown={(e) => beginDrag(e, task, edge)} onClick={(e) => e.stopPropagation()} />
      ))}
    </div>
  );
}

export default memo(TaskCard);
