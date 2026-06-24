import { useCallback, useRef } from 'react';
import { useSeekDate } from 'app/hooks/useSeekDate';
import { useFetchForYear } from 'app/hooks/useFetchForYear';
import { FullMonthInYear } from './components/FullMonthInYear';
import { EventModal, type IEventModalHandle } from 'app/components/organisms/EventModal';
import { DayDrawer, type IDayDrawerHandle } from 'app/components/organisms/DayDrawer';
import { Toolbar } from 'app/components/molecules/Toolbar';
import type { IEvent } from 'app/store/slices/eventSlice';
import { TitleYearPage } from './components/Title';
import type { IFullMonthInYearHandle, ITitleYearPageHandle } from './types';
import { getEventFormData } from 'app/utils/event';

export function YearView() {
  const defaultYear = useRef(new Date().getFullYear()).current;
  const yearRef = useRef<IFullMonthInYearHandle>(null);
  const modalRef = useRef<IEventModalHandle>(null);
  const drawerRef = useRef<IDayDrawerHandle>(null);
  const titleRef = useRef<ITitleYearPageHandle>(null);
  const handleAddEvent = useCallback((date: Date) => {
    drawerRef.current?.close();
    modalRef.current?.open({ startDate: date, endDate: date });
  }, []);

  const handleEventClick = useCallback((event: IEvent) => {
    modalRef.current?.open(getEventFormData(event));
  }, []);

  useSeekDate((d) => {
    const year = d.getFullYear();
    yearRef.current?.onSetYear(year);
    titleRef.current?.setYear(year);
  });

  const fetchForYear = useFetchForYear();
  const handleSync = (newYear: number) => {
    if (!yearRef.current || !titleRef.current) return;
    yearRef.current.onSetYear(newYear);
    titleRef.current.setYear(newYear);
    fetchForYear(newYear);
  };
  const handlePrev = () => handleSync((yearRef.current?.getYear() ?? defaultYear) - 1);
  const handleNext = () => handleSync((yearRef.current?.getYear() ?? defaultYear) + 1);
  const handleToday = () => handleSync(defaultYear);
  const handleSelectDay = (date: Date) => {
    drawerRef.current?.open(date);
  };
  return (
    <main className='max-w-360 mx-auto px-margin py-lg flex flex-col gap-6'>
      <EventModal ref={modalRef} />
      <DayDrawer ref={drawerRef} onAddEvent={handleAddEvent} onEventClick={handleEventClick} />
      <Toolbar
        align='end'
        title={<TitleYearPage defaultYear={defaultYear} ref={titleRef} onYearChange={handleSync} />}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />
      <FullMonthInYear ref={yearRef} defaultYear={defaultYear} onDaySelect={handleSelectDay} />
    </main>
  );
}
