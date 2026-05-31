import { useCallback, useRef } from 'react';
import { EventModal, type IEventModalHandle } from 'app/components/organisms/EventModal';
import { DayDrawer, type IDayDrawerHandle } from 'app/components/organisms/DayDrawer';
import { Toolbar } from 'app/components/molecules/Toolbar';
import { TitleMonthPage } from './components/Title';
import { MonthViewGrid } from './components/MonthViewGrid';
import type { ITitleMonthPageHandle, IMonthViewGridHandle } from './types';
import { MONTH_NAMES } from 'app/utils/calendar';
import type { IEvent } from 'app/store/slices/eventSlice';
import { useSeekDate } from 'app/hooks/useSeekDate';

const formatTitle = (date: Date) => `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;

export function MonthView() {
  const defaultDate = useRef(new Date()).current;
  const gridRef = useRef<IMonthViewGridHandle>(null);
  const modalRef = useRef<IEventModalHandle>(null);
  const drawerRef = useRef<IDayDrawerHandle>(null);
  const titleRef = useRef<ITitleMonthPageHandle>(null);
  const dateCursor = useRef(defaultDate);

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

  const handleDayClick = useCallback((date: Date) => {
    drawerRef.current?.open(date);
  }, []);

  const handleAddEvent = useCallback((date: Date) => {
    drawerRef.current?.close();
    modalRef.current?.open({ startDate: date, endDate: date });
  }, []);

  useSeekDate((d) => {
    dateCursor.current = d;
    gridRef.current?.updateMonth(d.getFullYear(), d.getMonth());
    titleRef.current?.setTitle(formatTitle(d));
  });

  const handleSync = (newDate: Date) => {
    dateCursor.current = newDate;
    gridRef.current?.updateMonth(newDate.getFullYear(), newDate.getMonth());
    titleRef.current?.setTitle(formatTitle(newDate));
  };
  const handlePrev = () => {
    const d = new Date(dateCursor.current);
    d.setMonth(d.getMonth() - 1);
    handleSync(d);
  };
  const handleNext = () => {
    const d = new Date(dateCursor.current);
    d.setMonth(d.getMonth() + 1);
    handleSync(d);
  };
  const handleToday = () => handleSync(new Date());

  return (
    <main className='max-w-360 mx-auto px-margin py-lg flex flex-col gap-6'>
      <EventModal ref={modalRef} />
      <DayDrawer ref={drawerRef} onAddEvent={handleAddEvent} onEventClick={handleEventClick} />
      <Toolbar
        align='end'
        title={<TitleMonthPage defaultTitle={formatTitle(defaultDate)} ref={titleRef} />}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />
      <MonthViewGrid
        ref={gridRef}
        defaultYear={defaultDate.getFullYear()}
        defaultMonth={defaultDate.getMonth()}
        onDayClick={handleDayClick}
        onEventClick={handleEventClick}
      />
    </main>
  );
}
