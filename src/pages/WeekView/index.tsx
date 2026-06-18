import { useCallback, useRef } from 'react';
import { useFetchForYear } from 'app/hooks/useFetchForYear';
import { WeekGrid } from './components/WeekGrid';
import { TitleWeekPage } from './components/Title';
import { Toolbar } from 'app/components/molecules/Toolbar';
import { EventModal, type IEventModalHandle } from 'app/components/organisms/EventModal';
import { formatWeekRange, getWeekDays } from 'app/pages/WeekView/utils';
import type { IEvent } from 'app/store/slices/eventSlice';
import type { ITitleWeekPageHandle, IWeekGridHandle } from './types';
import { WEEK_START } from './const';
import { useSeekDate } from 'app/hooks/useSeekDate';
import { getEventFormData } from 'app/utils/event';

export function WeekView() {
  const gridRef = useRef<IWeekGridHandle>(null);
  const modalRef = useRef<IEventModalHandle>(null);
  const titleRef = useRef<ITitleWeekPageHandle>(null);
  const defaultTitle = useRef(formatWeekRange(getWeekDays(new Date(), WEEK_START))).current;

  useSeekDate((date) => gridRef.current?.goToDate(date));

  const onPrev = useCallback(() => gridRef.current?.prev(), []);
  const onNext = useCallback(() => gridRef.current?.next(), []);
  const onToday = useCallback(() => gridRef.current?.goToday(), []);

  const fetchForYear = useFetchForYear();
  const handleWeekChange = useCallback((days: Date[]) => {
    titleRef.current?.setTitle(formatWeekRange(days));
    const years = [...new Set(days.map((d) => d.getFullYear()))];
    years.forEach(fetchForYear);
  }, [fetchForYear]);

  const handleEventClick = useCallback((event: IEvent) => {
    modalRef.current?.open(getEventFormData(event));
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
