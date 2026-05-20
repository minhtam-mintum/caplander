import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { MonthCalendar } from 'app/components/molecules/MonthCalendar';
import { NavigationControls } from 'app/components/molecules/NavigationControls';
import { MONTH_NAMES } from 'app/utils/calendar';
import type { RootState } from 'app/store';

export function MonthView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const tasks = useSelector((state: RootState) => state.tasks.items);

  const taskCountByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const task of tasks) {
      map[task.date] = (map[task.date] ?? 0) + 1;
    }
    return map;
  }, [tasks]);
  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  }

  function goToToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }

  return (
    <main className='max-w-360 mx-auto px-margin py-lg'>
      <div className='flex items-end justify-between mb-6'>
        <div>
          <h2 className='text-headline-lg text-on-surface'>
            {MONTH_NAMES[month]} {year}
          </h2>
          <p className='text-body-md text-on-surface-variant'>Monthly Overview</p>
        </div>
        <NavigationControls onPrev={prevMonth} onNext={nextMonth} onToday={goToToday} />
      </div>
      <MonthCalendar
        hasMonthName={false}
        classDayLabel='text-body-lg'
        year={year}
        month={month}
        taskCountByDate={taskCountByDate}
        labelFormat='full'
      />
    </main>
  );
}
