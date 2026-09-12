export interface CalendarDay {
  date: string;
  weekday: string;
  dayOfMonth: number;
}

export interface CalendarTask {
  id: string;
  date: string;
  startMinute: number;
  endMinute: number;
  title: string;
  description: string;
}

export type DragMode = 'create' | 'move' | 'start' | 'end';
export type PopupMode = 'create' | 'view' | 'edit' | 'menu';

export interface TaskPopup {
  mode: PopupMode;
  taskId: string;
  anchor: HTMLElement;
  point?: { x: number; y: number };
}
