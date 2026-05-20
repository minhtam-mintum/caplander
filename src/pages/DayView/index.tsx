import { useCallback, useRef, useState } from 'react';
import { DayCalendar, type IDayCalendarHandle } from 'app/components/organisms/DayCalendar';
import { Toolbar } from 'app/components/molecules/Toolbar';
import { formatFullDate, getDayTitle } from 'app/utils/day';

export function DayView() {
  const calendarRef = useRef<IDayCalendarHandle>(null);
  const [date, setDate] = useState(new Date());

  const onPrev  = useCallback(() => calendarRef.current?.prev(), []);
  const onNext  = useCallback(() => calendarRef.current?.next(), []);
  const onToday = useCallback(() => calendarRef.current?.goToday(), []);

  return (
    <main className='max-w-360 mx-auto px-margin py-lg flex flex-col gap-6'>
      <Toolbar
        align='start'
        title={
          <div>
            <h1 className='text-headline-xl text-on-surface'>{getDayTitle(date)}</h1>
            <p className='text-body-lg text-on-surface-variant'>{formatFullDate(date)}</p>
          </div>
        }
        onPrev={onPrev}
        onNext={onNext}
        onToday={onToday}
      />
      <DayCalendar ref={calendarRef} onDateChange={setDate} />
    </main>
  );
}
