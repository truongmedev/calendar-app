import { CalendarTask } from './types';

export interface TaskLayout {
  column: number;
  columns: number;
  conflict: boolean;
}

export function layoutDayTasks(tasks: CalendarTask[]): Map<string, TaskLayout> {
  const layouts = new Map<string, TaskLayout>();
  const sorted = [...tasks].sort((a, b) => a.startMinute - b.startMinute || b.endMinute - a.endMinute || a.id.localeCompare(b.id));
  let group: string[] = [];
  let columnEnds: number[] = [];
  let groupEnd = -1;
  const finishGroup = () => {
    group.forEach((id) => {
      const layout = layouts.get(id)!;
      layout.columns = columnEnds.length;
      layout.conflict = group.length > 1;
    });
    group = [];
    columnEnds = [];
  };
  sorted.forEach((task) => {
    if (task.endMinute <= task.startMinute) return;
    if (task.startMinute >= groupEnd) finishGroup();
    let column = columnEnds.findIndex((end) => end <= task.startMinute);
    if (column === -1) column = columnEnds.length;
    columnEnds[column] = task.endMinute;
    layouts.set(task.id, { column, columns: 1, conflict: false });
    group.push(task.id);
    groupEnd = Math.max(groupEnd, task.endMinute);
  });
  finishGroup();
  return layouts;
}
