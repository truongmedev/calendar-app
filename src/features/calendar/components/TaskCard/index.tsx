import './style.css';
import { memo, MouseEvent, PointerEvent, KeyboardEvent } from 'react';
import { CalendarTask, DragMode, TaskPopup } from '../../model/types';
import { formatTime, PIXELS_PER_MINUTE } from '../../model/time';

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
  const className = [
    'calendar-task',
    selected && 'calendar-task--selected',
    conflict && 'calendar-task--conflict',
    draft && 'calendar-task--draft',
  ].filter(Boolean).join(' ');

  const selectTask = (anchor: HTMLElement) => {
    if (!draft && !selected) openPopup({ mode: 'view', taskId: task.id, anchor });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (selected) beginDrag(event, task, 'move');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    selectTask(event.currentTarget);
  };

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    if (draft) return;
    event.preventDefault();
    event.stopPropagation();
    openPopup({
      mode: 'menu',
      taskId: task.id,
      anchor: event.currentTarget,
      point: { x: event.clientX, y: event.clientY },
    });
  };

  return (
    <div
      className={className}
      data-draft={draft ? '' : undefined}
      role={draft ? undefined : 'button'}
      tabIndex={draft ? undefined : 0}
      aria-pressed={draft ? undefined : selected}
      title={`${task.title || '(Không có tiêu đề)'} · ${timeLabel}`}
      style={{
        top: task.startMinute * PIXELS_PER_MINUTE,
        height: Math.max(1, task.endMinute - task.startMinute) * PIXELS_PER_MINUTE,
        left: `${column / columns * 100}%`,
        width: `calc(${100 / columns}% - 6px)`,
      }}
      onPointerDown={handlePointerDown}
      onClick={(event) => selectTask(event.currentTarget)}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
    >
      {task.title && <div className="calendar-task-title">{task.title}</div>}
      <div className="calendar-task-time">{timeLabel}</div>
      {selected && (['start', 'end'] as const).map((edge) => (
        <div
          key={edge}
          className={`calendar-resize-handle calendar-resize-handle--${edge}`}
          title={edge === 'start' ? 'Kéo để đổi giờ bắt đầu' : 'Kéo để đổi giờ kết thúc'}
          onPointerDown={(event) => beginDrag(event, task, edge)}
          onClick={(event) => event.stopPropagation()}
        />
      ))}
    </div>
  );
}

export default memo(TaskCard);
