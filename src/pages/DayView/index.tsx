import { useCallback, useRef } from 'react';
import { DayTimeGrid, type IDayTimeGridHandle } from './components/DayTimeGrid';
import { TitleDayPage } from './components/Title';
import { Toolbar } from 'app/components/molecules/Toolbar';
import { EventModal, type IEventModalHandle } from 'app/components/organisms/EventModal';
import type { IEvent } from 'app/store/slices/eventSlice';
import type { ITitleDayPageHandle } from 'app/pages/DayView/types';
import { useSeekDate } from 'app/hooks/useSeekDate';

export function DayView() {
  const gridRef = useRef<IDayTimeGridHandle>(null);
  const modalRef = useRef<IEventModalHandle>(null);
  const titleRef = useRef<ITitleDayPageHandle>(null);
  const defaultDate = useRef(new Date()).current;

  useSeekDate((date) => gridRef.current?.goToDate(date));

  const onPrev  = useCallback(() => gridRef.current?.prev(), []);
  const onNext  = useCallback(() => gridRef.current?.next(), []);
  const onToday = useCallback(() => gridRef.current?.goToday(), []);

  const handleDateChange = useCallback((date: Date) => {
    titleRef.current?.setDate(date);
  }, []);

  const handleEventClick = useCallback((event: IEvent) => {
    modalRef.current?.open({
      id: event.id,
      name: event.name,
      startDate: new Date(Math.floor(event.start / 86400000) * 86400000),
      startTime: event.start % 86400000,
      endDate: new Date(Math.floor(event.end / 86400000) * 86400000),
      endTime: event.end % 86400000,
      alert: event.alert,
      label: event.label,
      notes: event.notes,
    });
  }, []);

  return (
    <main className='max-w-360 mx-auto px-margin py-lg flex flex-col gap-6'>
      <EventModal ref={modalRef} />
      <Toolbar
        align='start'
        title={<TitleDayPage defaultDate={defaultDate} ref={titleRef} />}
        onPrev={onPrev}
        onNext={onNext}
        onToday={onToday}
      />
      <DayTimeGrid ref={gridRef} onDateChange={handleDateChange} onEventClick={handleEventClick} />
    </main>
  );
}
