import { memo, RefObject, useCallback, useMemo, useReducer } from 'react';
import { CalendarDay, CalendarTask, TaskPopup as Popup } from '../model/types';
import { calendarReducer, initialCalendarState } from '../model/state';
import { layoutDayTasks } from '../model/layout';
import { clamp, MINUTES_PER_DAY, PIXELS_PER_MINUTE } from '../model/time';
import useTaskDrag from '../hooks/useTaskDrag';
import TaskCard from './TaskCard';
import TaskPopup from './TaskPopup';

interface Props {
  days: CalendarDay[];
  scrollerRef: RefObject<HTMLDivElement | null>;
}

function CalendarLayer({ days, scrollerRef }: Props) {
  const [state, dispatch] = useReducer(calendarReducer, initialCalendarState);
  const beginDrag = useTaskDrag(scrollerRef, dispatch);
  const openPopup = useCallback((popup: Popup) => dispatch({ type: 'open', popup }), []);
  const dayLayouts = useMemo(() => {
    const allTasks = state.draft ? [...state.tasks, state.draft] : state.tasks;
    return days.map((day) => {
      const tasks = allTasks.filter((task) => task.date === day.date);
      return { day, tasks, layouts: layoutDayTasks(tasks) };
    });
  }, [days, state.tasks, state.draft]);
  const popupTask = state.draft?.id === state.popup?.taskId ? state.draft : state.tasks.find((task) => task.id === state.popup?.taskId);

  return <>
    <div className="calendar-layers" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
      {dayLayouts.map(({ day, tasks, layouts }) => (
        <div key={day.date} className="calendar-day-layer" onPointerDown={(e) => {
          const startMinute = clamp(Math.round((e.clientY - e.currentTarget.getBoundingClientRect().top) / PIXELS_PER_MINUTE), 0, MINUTES_PER_DAY - 1);
          const task: CalendarTask = { id: crypto.randomUUID(), date: day.date, startMinute, endMinute: startMinute, title: '', description: '' };
          beginDrag(e, task, 'create');
        }}>
          {tasks.map((task) => {
            const layout = layouts.get(task.id) ?? { column: 0, columns: 1, conflict: false };
            const selected = state.popup?.taskId === task.id && (state.popup.mode === 'view' || state.popup.mode === 'create');
            return <TaskCard key={task.id} task={task} {...layout} selected={selected} draft={state.draft?.id === task.id}
              beginDrag={beginDrag} openPopup={openPopup} />;
          })}
        </div>
      ))}
    </div>
    {state.popup && popupTask && <TaskPopup key={`${state.popup.mode}-${popupTask.id}`} popup={state.popup} task={popupTask} dispatch={dispatch} />}
  </>;
}

export default memo(CalendarLayer);
