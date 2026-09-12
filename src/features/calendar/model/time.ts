import { CalendarDay, CalendarTask, DragMode } from './types';

export const MINUTES_PER_DAY = 1440;
export const HOUR_HEIGHT = 60;
export const PIXELS_PER_MINUTE = HOUR_HEIGHT / 60;
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function formatTime(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
}

export function parseTime(value: string) {
  if (!/^(([01]\d|2[0-3]):[0-5]\d|24:00)$/.test(value)) return NaN;
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('en-GB');
}

export function parseDate(value: string) {
  const [day, month, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day);
}

export function formatLongDate(value: string) {
  return parseDate(value).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function getWeekDays(startDate: string): CalendarDay[] {
  const start = parseDate(startDate);
  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(start);
    date.setDate(start.getDate() + offset);
    return { date: formatDate(date), weekday: date.toLocaleDateString('en-GB', { weekday: 'short' }), dayOfMonth: date.getDate() };
  });
}

export function changeTaskRange(task: CalendarTask, mode: DragMode, delta: number): CalendarTask {
  let { startMinute, endMinute } = task;
  if (mode === 'create') {
    const cursor = clamp(startMinute + delta, 0, MINUTES_PER_DAY);
    endMinute = Math.max(startMinute, cursor);
    startMinute = Math.min(startMinute, cursor);
  } else if (mode === 'move') {
    const duration = endMinute - startMinute;
    startMinute = clamp(startMinute + delta, 0, MINUTES_PER_DAY - duration);
    endMinute = startMinute + duration;
  } else if (mode === 'start') {
    startMinute = clamp(startMinute + delta, 0, endMinute - 1);
  } else {
    endMinute = clamp(endMinute + delta, startMinute + 1, MINUTES_PER_DAY);
  }
  return { ...task, startMinute, endMinute };
}
