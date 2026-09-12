import { DATE_LOCALE } from "../constants";
import { CalendarDay } from "../types";

export const getDate = (date: Date): string => {
  return date.toLocaleDateString(DATE_LOCALE);
}

export const getTimeLabel = (date: Date): string => {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const getTimeLabelFromNumbers = (
  hour: number,
): string => {
  return `${String(hour).padStart(2, "0")}:${String(0).padStart(2, "0")}`;
};

export const getNext7Days = (startDate: string): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const [day, month, year] = startDate.split('/').map(Number);
  const start = new Date(year, month - 1, day);
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push({
      date: getDate(date),
      dayOfWeek: date.toLocaleDateString(DATE_LOCALE, { weekday: "short" })
    });
  }
  return days;
};

export const getTimeByPosition = (position: number): string => {
  const hour = Math.floor(position / 60);
  const minute = Math.floor(position % 60);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export const getPositionByTime = (time: string): number => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}