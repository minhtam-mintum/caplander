import { type DayLabelFormat, type WeekStart } from 'app/utils/calendar';
import { type ReactNode } from 'react';

export interface ICalendarProps extends IMonthCalendarProps {}

export interface IMonthCalendarHandle {
  updateDate: (newDate: Date) => void;
}

export interface IWeekCell {
  day: number;
  year: number;
  month: number;
  isCurrentMonth: boolean;
}

export interface IRenderDayProps {
  day: number;
  year: number;
  month: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  onClick?: () => void;
  isLastRow: boolean;
}

export interface IMonthCalendarProps {
  defaultDate?: Date;
  minDate?: Date;
  labelFormat?: DayLabelFormat;
  weekStart?: WeekStart;
  classCard?: string;
  classDayLabel?: string;
  classMonthName?: string;
  classInner?: string;
  classDayLabelRow?: string;
  classWeekGrid?: string;
  hasMonthName?: boolean;
  highlightToday?: boolean;
  onDayClick?: (date: Date) => void;
  renderDay?: (props: IRenderDayProps) => ReactNode;
  renderDayLabel?: (label: string, index: number) => ReactNode;
  renderOverlay?: (weekCells: IWeekCell[], weeks: IWeekCell[][]) => ReactNode;
}

export interface IWeekCalendarProps {
  cells: IWeekCell[];
  defaultDate?: Date;
  minDate?: Date;
  highlightToday?: boolean;
  onDayClick?: (date: Date) => void;
  renderDay?: (props: IRenderDayProps) => ReactNode;
  overlay?: ReactNode;
  classGrid?: string;
  isLastRow: boolean;
}
