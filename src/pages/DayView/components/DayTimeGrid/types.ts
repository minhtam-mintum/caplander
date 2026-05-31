import type { IEvent } from 'app/store/slices/eventSlice';

export type DayDragState =
  | { type: 'timed'; id: string; grabOffsetMin: number; durationMs: number }
  | { type: 'allDay'; id: string };

export interface IDayTimeGridHandle {
  prev: () => void;
  next: () => void;
  goToday: () => void;
  goToDate: (date: Date) => void;
}

export interface IDayTimeGridProps {
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: IEvent) => void;
}
