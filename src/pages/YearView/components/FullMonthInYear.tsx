import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { MonthCalendar } from 'app/components/molecules/MonthCalendar';

export interface IFullMonthInYearHandle {
  onSetYear: (newYear: number) => void;
  /** Resets the displayed year back to `defaultYear` (falls back to the current year if `defaultYear` was not provided). */
  onResetYear: VoidFunction;
  getYear: VoidFunction;
}

interface IFullMonthInYearProps {
  countByDate?: Record<string, number>;
  defaultYear?: number;
  onDaySelect?: (dateStr: string) => void;
}

export const FullMonthInYear = forwardRef<IFullMonthInYearHandle, IFullMonthInYearProps>(
  function FullMonthInYear(
    { countByDate = {}, defaultYear = new Date().getFullYear(), onDaySelect },
    ref,
  ) {
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
        getYear: () => {
          return yearCursor.current;
        },
      }),
      [],
    );

    return (
      <div className='grid grid-cols-4 gap-4'>
        {Array.from({ length: 12 }, (_, month) => (
          <MonthCalendar
            key={month}
            defaultDate={new Date(year, month)}
            countByDate={countByDate}
            labelFormat='short'
            onDayClick={onDaySelect}
          />
        ))}
      </div>
    );
  },
);
