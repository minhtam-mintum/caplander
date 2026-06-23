import { useCallback, useRef } from 'react';
import { useFetchForYear } from 'app/hooks/useFetchForYear';
import { DayTimeGrid, type IDayTimeGridHandle } from './components/DayTimeGrid';
import { TitleDayPage } from './components/Title';
import { Toolbar } from 'app/components/molecules/Toolbar';
import { EventModal, type IEventModalHandle } from 'app/components/organisms/EventModal';
import type { IEvent } from 'app/store/slices/eventSlice';
import type { ITitleDayPageHandle } from 'app/pages/DayView/types';
import { useSeekDate } from 'app/hooks/useSeekDate';
import { getEventFormData } from 'app/utils/event';

export function DayView() {
  const gridRef = useRef<IDayTimeGridHandle>(null);
  const modalRef = useRef<IEventModalHandle>(null);
  const titleRef = useRef<ITitleDayPageHandle>(null);
  const defaultDate = useRef(new Date()).current;

  useSeekDate((date) => gridRef.current?.goToDate(date));

  const onPrev  = useCallback(() => gridRef.current?.prev(), []);
  const onNext  = useCallback(() => gridRef.current?.next(), []);
  const onToday = useCallback(() => gridRef.current?.goToday(), []);

  const fetchForYear = useFetchForYear();
  const handleDateChange = useCallback((date: Date) => {
    titleRef.current?.setDate(date);
    fetchForYear(date.getFullYear());
  }, [fetchForYear]);

  const handleTitleDayChange = useCallback((date: Date) => {
    gridRef.current?.goToDate(date);
  }, []);

  const handleEventClick = useCallback((event: IEvent) => {
    modalRef.current?.open(getEventFormData(event));
  }, []);

  return (
    <main className='h-full min-h-0 max-w-360 mx-auto px-margin py-lg flex flex-col gap-4 overflow-hidden'>
      <EventModal ref={modalRef} />
      <Toolbar
        align='start'
        title={
          <TitleDayPage
            defaultDate={defaultDate}
            ref={titleRef}
            onDayChange={handleTitleDayChange}
          />
        }
        onPrev={onPrev}
        onNext={onNext}
        onToday={onToday}
      />
      <div className='min-h-0 flex-1'>
        <DayTimeGrid
          ref={gridRef}
          onDateChange={handleDateChange}
          onEventClick={handleEventClick}
        />
      </div>
    </main>
  );
}
