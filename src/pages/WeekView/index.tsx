import { useCallback, useRef } from 'react';
import { useFetchForYear } from 'app/hooks/useFetchForYear';
import { WeekGrid } from './components/WeekGrid';
import { TitleWeekPage, type ITitleWeekPageHandle } from './components/TitleWeekPage';
import { Toolbar } from 'app/components/molecules/Toolbar';
import { EventModal, type IEventModalHandle } from 'app/components/organisms/EventModal';
import type { IEvent } from 'app/store/slices/eventSlice';
import type { IWeekGridHandle } from './types';
import { useSeekDate } from 'app/hooks/useSeekDate';
import { getEventFormData } from 'app/utils/event';

export function WeekView() {
  const defaultDate = useRef(new Date()).current;
  const gridRef = useRef<IWeekGridHandle>(null);
  const modalRef = useRef<IEventModalHandle>(null);
  const titleRef = useRef<ITitleWeekPageHandle>(null);

  useSeekDate((date) => {
    gridRef.current?.goToDate(date);
    titleRef.current?.setDate(date);
  });

  const onPrev = useCallback(() => gridRef.current?.prev(), []);
  const onNext = useCallback(() => gridRef.current?.next(), []);
  const onToday = useCallback(() => gridRef.current?.goToday(), []);

  const fetchForYear = useFetchForYear();
  const handleWeekChange = useCallback((days: Date[]) => {
    titleRef.current?.setDate(days[0]);
    const years = [...new Set(days.map((d) => d.getFullYear()))];
    years.forEach(fetchForYear);
  }, [fetchForYear]);

  const handleTitleWeekChange = useCallback((date: Date) => {
    gridRef.current?.goToDate(date);
  }, []);

  const handleEventClick = useCallback((event: IEvent) => {
    modalRef.current?.open(getEventFormData(event));
  }, []);

  return (
    <main className='h-full min-h-0 max-w-360 mx-auto px-margin py-lg flex flex-col gap-4 overflow-hidden'>
      <EventModal ref={modalRef} />
      <Toolbar
        title={
          <TitleWeekPage
            defaultDate={defaultDate}
            ref={titleRef}
            onWeekChange={handleTitleWeekChange}
          />
        }
        onPrev={onPrev}
        onNext={onNext}
        onToday={onToday}
      />
      <div className='min-h-0 flex-1'>
        <WeekGrid ref={gridRef} onWeekChange={handleWeekChange} onEventClick={handleEventClick} />
      </div>
    </main>
  );
}
