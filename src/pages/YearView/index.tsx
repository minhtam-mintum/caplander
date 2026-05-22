import { useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FullMonthInYear, type IFullMonthInYearHandle } from './components/FullMonthInYear';
import { EventModal, type IEventModalHandle } from 'app/components/organisms/EventModal';
import { Toolbar } from 'app/components/molecules/Toolbar';
import type { RootState } from 'app/store';
import { ITitleYearPageHandle, TitleYearPage } from './components/Title';

export function YearView() {
  const defaultYear = useRef(new Date().getFullYear()).current;
  const yearRef = useRef<IFullMonthInYearHandle>(null);
  const modalRef = useRef<IEventModalHandle>(null);
  const titleRef = useRef<ITitleYearPageHandle>(null);
  const tasks = useSelector((state: RootState) => state.tasks.items);

  const countByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const task of tasks) {
      map[task.date] = (map[task.date] ?? 0) + 1;
    }
    return map;
  }, [tasks]);
  const handleSync = (newYear: number) => {
    if (!yearRef.current || !titleRef.current) return;
    yearRef.current.onSetYear(newYear);
    titleRef.current.setYear(newYear);
  };
  const handlePrev = () => handleSync((yearRef.current?.getYear() ?? defaultYear) - 1);
  const handleNext = () => handleSync((yearRef.current?.getYear() ?? defaultYear) + 1);
  const handleToday = () => handleSync(defaultYear);
  const handleDaySelect = (date: string) => modalRef.current?.open();

  return (
    <main className='max-w-360 mx-auto px-margin py-lg flex flex-col gap-6'>
      <EventModal ref={modalRef} />
      <Toolbar
        align='end'
        title={<TitleYearPage defaultYear={defaultYear} ref={titleRef} />}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />
      <FullMonthInYear
        ref={yearRef}
        defaultYear={defaultYear}
        countByDate={countByDate}
        onDaySelect={handleDaySelect}
      />
    </main>
  );
}
