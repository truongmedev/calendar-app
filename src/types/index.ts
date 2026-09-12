export interface CalendarDay {
  date: string;
  dayOfWeek: string;
}

export interface CalendarTimeSelection {
  day: string;
  startPosition: number;
  endPosition?: number;
  startTime: string;
  endTime?: string;
}