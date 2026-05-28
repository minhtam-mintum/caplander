import type { IEvent } from 'app/store/slices/eventSlice';

export interface IMonthViewGridHandle {
  updateMonth: (year: number, month: number) => void;
}

export interface IMonthViewGridProps {
  defaultYear: number;
  defaultMonth: number;
  onDayClick: (date: Date) => void;
  onEventClick: (event: IEvent) => void;
}

export interface DragInfo {
  id: string;
  grabOffset: number;
  span: number;
}

export interface BarItem {
  ev: IEvent;
  startCol: number;
  endCol: number;
  startsBefore: boolean;
  endsAfter: boolean;
  lane: number;
  span: number;
  evStartMs: number;
  evSpan: number;
}

export interface ITitleMonthPageHandle {
  setTitle: (title: string) => void;
}

export interface ITitleMonthPageProps {
  defaultTitle: string;
}
