import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { MonthCalendar } from 'app/components/molecules/MonthCalendar';

export interface IYearCalendarHandle {
  onSetYear: (newYear: number) => void;
  /** Resets the displayed year back to `defaultYear` (falls back to the current year if `defaultYear` was not provided). */
  onResetYear: VoidFunction;
  year: number;
}

interface IYearCalendarProps {
  countByDate?: Record<string, number>;
  defaultYear?: number;
  onDaySelect?: (dateStr: string) => void;
}

export const YearCalendar = forwardRef<IYearCalendarHandle, IYearCalendarProps>(
  function YearCalendar({ countByDate = {}, defaultYear = new Date().getFullYear(), onDaySelect }, ref) {
    const yearCursor = useRef(defaultYear);
    const [, forceUpdate] = useState(0);

    const year = yearCursor.current;

    useImperativeHandle(
      ref,
      () => ({
        onSetYear: (newYear: number) => {
          yearCursor.current = newYear;
          forceUpdate((n) => n + 1);
        },
        /** Resets the displayed year back to `defaultYear` (falls back to the current year if `defaultYear` was not provided). */
        onResetYear: () => {
          yearCursor.current = defaultYear;
          forceUpdate((n) => n + 1);
        },
        year,
      }),
      [year],
    );

    return (
      <div className='grid grid-cols-2 gap-4'>
        {Array.from({ length: 12 }, (_, month) => (
          <MonthCalendar
            key={month}
            year={year}
            month={month}
            countByDate={countByDate}
            labelFormat='short'
            onDayClick={onDaySelect}
          />
        ))}
      </div>
    );
  },
);
