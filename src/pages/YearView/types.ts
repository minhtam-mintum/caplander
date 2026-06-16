import type { Dispatch, SetStateAction } from 'react';

export interface IFullMonthInYearHandle {
  onSetYear: (newYear: number) => void;
  /** Resets the displayed year back to `defaultYear` (falls back to the current year if `defaultYear` was not provided). */
  onResetYear: VoidFunction;
  getYear: () => number;
}

export interface IFullMonthInYearProps {
  defaultYear?: number;
  onDaySelect: (date: Date) => void;
}

export interface ITitleYearPageHandle {
  setYear: Dispatch<SetStateAction<number>>;
}

export interface ITitleYearPageProps {
  defaultYear: number;
  onYearChange: (year: number) => void;
}
