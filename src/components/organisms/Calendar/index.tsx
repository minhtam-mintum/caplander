import { useCallback, useState } from 'react';
import { MonthCalendar } from 'app/components/molecules/MonthCalendar';
import { Toolbar } from 'app/components/molecules/Toolbar';
import { MONTH_NAMES } from 'app/utils/calendar';

interface ICalendarProps {
  view: 'year' | 'month';
  countByDate?: Record<string, number>;
}

export function Calendar({ countByDate = {} }: ICalendarProps) {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());

  const handleDayClick = useCallback((dateStr: string) => {}, []);

  const prevMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);
  const nextMonth = useCallback(() => {
    setMonth((m) => {
      if (m === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);
  const goToMonth = useCallback(() => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  }, []);

  return (
    <div className='flex flex-col gap-6'>
      <Toolbar
        align='end'
        title={
          <div>
            <h2 className='text-headline-lg text-on-surface'>
              {MONTH_NAMES[month]} {year}
            </h2>
            <p className='text-body-md text-on-surface-variant'>Monthly Overview</p>
          </div>
        }
        onPrev={prevMonth}
        onNext={nextMonth}
        onToday={goToMonth}
      />
      <MonthCalendar
        hasMonthName={false}
        classDayLabel='text-body-lg'
        year={year}
        month={month}
        countByDate={countByDate}
        labelFormat='full'
        onDayClick={handleDayClick}
      />
    </div>
  );
}
