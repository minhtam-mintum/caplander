import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MonthCalendar,
  type IMonthCalendarHandle,
} from 'app/components/molecules/Calendar/MonthCalendar';
import { Toolbar } from 'app/components/molecules/Toolbar';
import { MONTH_NAMES } from 'app/utils/calendar';

interface ICalendarProps {
  defaultDate?: Date;
  minDate?: string;
  onDayClick?: (dateStr: string) => void;
}

export function Calendar({ defaultDate, minDate, onDayClick }: ICalendarProps) {
  const [viewDate, setViewDate] = useState(defaultDate ?? new Date());
  const calendarRef = useRef<IMonthCalendarHandle>(null);

  useEffect(() => {
    calendarRef.current?.updateDate(viewDate);
  }, [viewDate]);

  const prevMonth = useCallback(() => {
    setViewDate((d) => {
      const next = new Date(d);
      next.setDate(1);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewDate((d) => {
      const next = new Date(d);
      next.setDate(1);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  }, []);

  const goToMonth = useCallback(() => setViewDate(new Date()), []);

  return (
    <div className='flex flex-col gap-3'>
      <Toolbar
        align='center'
        title={
          <h2 className='text-label-lg font-semibold text-on-surface'>
            {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
          </h2>
        }
        onPrev={prevMonth}
        onNext={nextMonth}
        onToday={goToMonth}
      />
      <MonthCalendar
        ref={calendarRef}
        hasMonthName={false}
        defaultDate={defaultDate}
        labelFormat='short'
        minDate={minDate}
        onDayClick={onDayClick}
      />
    </div>
  );
}
