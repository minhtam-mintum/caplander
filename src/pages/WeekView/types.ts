import type { IEvent } from 'app/store/slices/eventSlice';
export interface ITitleWeekPageHandle {
  setTitle: (title: string) => void;
}

export interface ITitleWeekPageProps {
  defaultTitle: string;
}

export type DragInfo =
  | { type: 'allDay'; id: string; grabOffset: number; span: number }
  | { type: 'timed'; id: string; grabOffsetMin: number; durationMs: number };

export interface IWeekGridHandle {
  prev: () => void;
  next: () => void;
  goToday: () => void;
}

export interface IWeekGridProps {
  onWeekChange?: (weekDays: Date[]) => void;
  onEventClick?: (event: IEvent) => void;
}
