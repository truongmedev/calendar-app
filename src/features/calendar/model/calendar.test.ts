import { CalendarTask } from './types';
import { changeTaskRange, formatTime, getWeekDays, parseTime } from './time';
import { layoutDayTasks, tasksOverlap } from './layout';
import { calendarReducer, initialCalendarState } from './state';

const task = (id: string, startMinute = 60, endMinute = 120): CalendarTask => ({
  id, date: '30/12/2026', startMinute, endMinute, title: id, description: '',
});

test('time parsing, midnight and week rollover', () => {
  expect(formatTime(1440)).toBe('24:00');
  expect(parseTime('24:00')).toBe(1440);
  expect(parseTime('24:01')).toBeNaN();
  expect(parseTime('9:30')).toBeNaN();
  expect(getWeekDays('30/12/2026').map((day) => day.date)).toEqual([
    '30/12/2026', '31/12/2026', '01/01/2027', '02/01/2027', '03/01/2027', '04/01/2027', '05/01/2027',
  ]);
});

test('moving clamps to the day without changing duration', () => {
  expect(changeTaskRange(task('a'), 'move', -100)).toMatchObject({ startMinute: 0, endMinute: 60 });
  expect(changeTaskRange(task('a'), 'move', 1500)).toMatchObject({ startMinute: 1380, endMinute: 1440 });
});

test('creation works in both directions and resizing cannot cross the other end', () => {
  expect(changeTaskRange(task('a', 120, 120), 'create', -60)).toMatchObject({ startMinute: 60, endMinute: 120 });
  expect(changeTaskRange(task('a', 120, 120), 'create', 60)).toMatchObject({ startMinute: 120, endMinute: 180 });
  expect(changeTaskRange(task('a'), 'start', 100)).toMatchObject({ startMinute: 119, endMinute: 120 });
  expect(changeTaskRange(task('a'), 'end', -100)).toMatchObject({ startMinute: 60, endMinute: 61 });
});

test('adjacency, other dates, and the task itself are not conflicts', () => {
  const a = task('a');
  expect(tasksOverlap(a, a)).toBe(false);
  expect(tasksOverlap(a, task('b', 120, 180))).toBe(false);
  expect(tasksOverlap(a, { ...task('b'), date: '31/12/2026' })).toBe(false);
  expect(tasksOverlap(a, task('b', 90, 100))).toBe(true);
});

test('layout reuses columns within overlap groups and resets for separate groups', () => {
  const layouts = layoutDayTasks([task('a', 0, 60), task('b', 30, 90), task('c', 60, 120), task('d', 150, 180)]);
  expect(Array.from(layouts.values())).toEqual([
    { column: 0, columns: 2, conflict: true }, { column: 1, columns: 2, conflict: true },
    { column: 0, columns: 2, conflict: true }, { column: 0, columns: 1, conflict: false },
  ]);
});

test('full overlaps each receive their own column', () => {
  const layouts = layoutDayTasks([task('a'), task('b'), task('c')]);
  expect(new Set(Array.from(layouts.values()).map((layout) => layout.column)).size).toBe(3);
  expect(Array.from(layouts.values()).every((layout) => layout.columns === 3)).toBe(true);
});

test('save edits by ID and delete preserves other tasks', () => {
  const a = task('a');
  const b = task('b');
  let state = calendarReducer(initialCalendarState, { type: 'save', task: a });
  state = calendarReducer(state, { type: 'save', task: b });
  state = calendarReducer(state, { type: 'save', task: { ...a, title: 'Edited' } });
  expect(state.tasks).toHaveLength(2);
  expect(state.tasks[1]).toBe(b);
  state = calendarReducer(state, { type: 'delete', id: 'a' });
  expect(state.tasks).toEqual([b]);
});

test('unchanged ranges reuse state and updates preserve unaffected task references', () => {
  const a = task('a');
  const b = task('b');
  const state = { ...initialCalendarState, tasks: [a, b] };
  expect(calendarReducer(state, { type: 'change', task: { ...a } })).toBe(state);
  const next = calendarReducer(state, { type: 'change', task: { ...a, startMinute: 70 } });
  expect(next.tasks[1]).toBe(b);
  expect(next.tasks[0].startMinute).toBe(70);
});
