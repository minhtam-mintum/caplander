import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Calendar } from 'app/components/organisms/Calendar';
import { EventModal } from 'app/components/organisms/EventModal';
import type { RootState } from 'app/store';

export function MonthView() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const tasks = useSelector((state: RootState) => state.tasks.items);

  const countByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const task of tasks) {
      map[task.date] = (map[task.date] ?? 0) + 1;
    }
    return map;
  }, [tasks]);

  const closeModal = useCallback(() => setSelectedDate(null), []);

  return (
    <main className='max-w-360 mx-auto px-margin py-lg'>
      <EventModal
        isOpen={selectedDate !== null}
        onClose={closeModal}
        initialData={selectedDate ? { date: selectedDate } : undefined}
      />
      <Calendar view='month' countByDate={countByDate} />
    </main>
  );
}
