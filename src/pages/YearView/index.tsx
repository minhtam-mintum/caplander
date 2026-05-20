import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { YearCalendar } from 'app/components/organisms/YearCalendar';
import type { RootState } from 'app/store';

export function YearView() {
  const [year, setYear] = useState(new Date().getFullYear());
  const tasks = useSelector((state: RootState) => state.tasks.items);

  const taskCountByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const task of tasks) {
      map[task.date] = (map[task.date] ?? 0) + 1;
    }
    return map;
  }, [tasks]);

  return (
    <main className='max-w-360 mx-auto px-margin py-lg'>
      <YearCalendar
        year={year}
        taskCountByDate={taskCountByDate}
        onPrevYear={() => setYear((y) => y - 1)}
        onNextYear={() => setYear((y) => y + 1)}
        onToday={() => setYear(new Date().getFullYear())}
      />
    </main>
  );
}
