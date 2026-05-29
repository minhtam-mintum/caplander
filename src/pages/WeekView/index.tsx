import { useCallback, useRef } from 'react';
import { WeekGrid } from './components/WeekGrid';
import { TitleWeekPage } from './components/Title';
import { Toolbar } from 'app/components/molecules/Toolbar';
import { EventModal, type IEventModalHandle } from 'app/components/organisms/EventModal';
import { formatWeekRange, getWeekDays } from 'app/pages/WeekView/utils';
import type { IEvent } from 'app/store/slices/eventSlice';
import type { ITitleWeekPageHandle, IWeekGridHandle } from './types';
import { WEEK_START } from './const';

export function WeekView() {
  const gridRef = useRef<IWeekGridHandle>(null);
  const modalRef = useRef<IEventModalHandle>(null);
  const titleRef = useRef<ITitleWeekPageHandle>(null);
  const defaultTitle = useRef(formatWeekRange(getWeekDays(new Date(), WEEK_START))).current;

  const onPrev = useCallback(() => gridRef.current?.prev(), []);
  const onNext = useCallback(() => gridRef.current?.next(), []);
  const onToday = useCallback(() => gridRef.current?.goToday(), []);

  const handleWeekChange = useCallback((days: Date[]) => {
    titleRef.current?.setTitle(formatWeekRange(days));
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
    <main className='max-w-360 mx-auto px-margin py-lg flex flex-col gap-4'>
      <EventModal ref={modalRef} />
      <Toolbar
        title={<TitleWeekPage defaultTitle={defaultTitle} ref={titleRef} />}
        onPrev={onPrev}
        onNext={onNext}
        onToday={onToday}
      />
      <WeekGrid ref={gridRef} onWeekChange={handleWeekChange} onEventClick={handleEventClick} />
    </main>
  );
}
