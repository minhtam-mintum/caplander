import { useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { EventModal, IEventModalHandle } from 'app/components/organisms/EventModal';
import type { RootState } from 'app/store';
import { Toolbar } from 'app/components/molecules/Toolbar';
import { ITitleMonthPageHandle, TitleMonthPage } from './components/Title';
import {
  IMonthCalendarHandle,
  MonthCalendar,
} from 'app/components/molecules/Calendar/MonthCalendar';
import { MONTH_NAMES } from 'app/utils/calendar';

const formatTitle = (date: Date) => `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;

export function MonthView() {
  const defaultDate = useRef(new Date()).current;
  const monthRef = useRef<IMonthCalendarHandle>(null);
  const modalRef = useRef<IEventModalHandle>(null);
  const titleRef = useRef<ITitleMonthPageHandle>(null);
  const dateCursor = useRef(defaultDate);
  const tasks = useSelector((state: RootState) => state.tasks.items);

  const countByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const task of tasks) {
      map[task.date] = (map[task.date] ?? 0) + 1;
    }
    return map;
  }, [tasks]);

  const handleSync = (newDate: Date) => {
    dateCursor.current = newDate;
    monthRef.current?.updateDate(newDate);
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
    <main className='max-w-360 mx-auto px-margin py-lg'>
      <EventModal ref={modalRef} />
      <Toolbar
        align='end'
        title={<TitleMonthPage defaultTitle={formatTitle(defaultDate)} ref={titleRef} />}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />
      <MonthCalendar
        hasMonthName={false}
        labelFormat='full'
        ref={monthRef}
        defaultDate={defaultDate}
        countByDate={countByDate}
      />
    </main>
  );
}
