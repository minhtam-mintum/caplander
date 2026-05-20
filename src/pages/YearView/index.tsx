import { useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { YearCalendar, type IYearCalendarHandle } from 'app/components/molecules/YearCalendar';
import { EventModal, type IEventModalHandle } from 'app/components/organisms/EventModal';
import { Toolbar } from 'app/components/molecules/Toolbar';
import type { RootState } from 'app/store';

export function YearView() {
  const yearRef = useRef<IYearCalendarHandle>(null);
  const modalRef = useRef<IEventModalHandle>(null);
  const tasks = useSelector((state: RootState) => state.tasks.items);

  const countByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const task of tasks) {
      map[task.date] = (map[task.date] ?? 0) + 1;
    }
    return map;
  }, [tasks]);

  const handlePrev = () => yearRef.current?.onSetYear(yearRef.current.year - 1);
  const handleNext = () => yearRef.current?.onSetYear(yearRef.current.year + 1);
  const handleToday = () => yearRef.current?.onResetYear();
  const handleDaySelect = (date: string) => modalRef.current?.open({ date });

  return (
    <main className='max-w-360 mx-auto px-margin py-lg flex flex-col gap-6'>
      <EventModal ref={modalRef} />
      <Toolbar
        align='end'
        title={
          <div>
            <h2 className='text-headline-lg text-on-surface'>
              {yearRef.current?.year ?? new Date().getFullYear()}
            </h2>
            <p className='text-body-md text-on-surface-variant'>Yearly Overview &amp; Heatmap</p>
          </div>
        }
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />
      <YearCalendar ref={yearRef} countByDate={countByDate} onDaySelect={handleDaySelect} />
    </main>
  );
}
