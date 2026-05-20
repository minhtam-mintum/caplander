import { useCallback, useRef, useState } from 'react';
import { WeekCalendar, type IWeekCalendarHandle } from 'app/components/organisms/WeekCalendar';
import { Toolbar } from 'app/components/molecules/Toolbar';
import { formatWeekRange, getWeekDays } from 'app/utils/week';

const WEEK_START = 1 as const;

export function WeekView() {
  const calendarRef = useRef<IWeekCalendarHandle>(null);
  const [weekDays, setWeekDays] = useState(() => getWeekDays(new Date(), WEEK_START));

  const onPrev  = useCallback(() => calendarRef.current?.prev(), []);
  const onNext  = useCallback(() => calendarRef.current?.next(), []);
  const onToday = useCallback(() => calendarRef.current?.goToday(), []);

  return (
    <main className='max-w-360 mx-auto px-margin py-lg flex flex-col gap-4'>
      <Toolbar
        title={<h2 className='text-headline-md text-on-surface'>{formatWeekRange(weekDays)}</h2>}
        onPrev={onPrev}
        onNext={onNext}
        onToday={onToday}
      />
      <WeekCalendar ref={calendarRef} onWeekChange={setWeekDays} />
    </main>
  );
}
