import { CalendarTask, TaskPopup } from './types';

export interface CalendarState {
  tasks: CalendarTask[];
  draft: CalendarTask | null;
  popup: TaskPopup | null;
}

export type CalendarAction =
  | { type: 'createDraft'; task: CalendarTask }
  | { type: 'updateRange'; task: CalendarTask }
  | { type: 'openPopup'; popup: TaskPopup }
  | { type: 'closePopup' }
  | { type: 'saveTask'; task: CalendarTask }
  | { type: 'deleteTask'; id: string };

export const initialCalendarState: CalendarState = { tasks: [], draft: null, popup: null };

export function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    case 'createDraft':
      return { ...state, draft: action.task, popup: null };
    case 'updateRange': {
      const current = state.draft?.id === action.task.id ? state.draft : state.tasks.find((task) => task.id === action.task.id);
      if (!current || (current.startMinute === action.task.startMinute && current.endMinute === action.task.endMinute)) return state;
      return state.draft?.id === action.task.id
        ? { ...state, draft: action.task }
        : { ...state, tasks: state.tasks.map((task) => task.id === action.task.id ? action.task : task) };
    }
    case 'openPopup':
      return { ...state, popup: action.popup, draft: action.popup.mode === 'create' ? state.draft : null };
    case 'closePopup':
      return { ...state, popup: null, draft: null };
    case 'saveTask':
      return {
        tasks: state.tasks.some((task) => task.id === action.task.id)
          ? state.tasks.map((task) => task.id === action.task.id ? action.task : task)
          : [...state.tasks, action.task], draft: null, popup: null
      };
    case 'deleteTask':
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.id), popup: null };
  }
}
