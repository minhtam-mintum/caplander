import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MonthCalendar,
  type IMonthCalendarHandle,
} from 'app/components/molecules/Calendar/components/MonthCalendar';
import { MonthPicker } from 'app/components/molecules/Calendar/components/MonthPicker';
import { GhostButton } from 'app/components/molecules/Buttons/GhostButton';
import { Toolbar } from 'app/components/molecules/Toolbar';
import { YearPicker } from 'app/components/molecules/YearPicker';
import { getDecadeStart } from 'app/components/molecules/YearPicker/utils';
import { MONTH_NAMES } from 'app/utils/calendar';

import { type ICalendarProps } from './types';

type ViewMode = 'day' | 'month' | 'year';

export function Calendar({ defaultDate, minDate, onDayClick }: ICalendarProps) {
  const [viewDate, setViewDate] = useState(defaultDate ?? new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const calendarRef = useRef<IMonthCalendarHandle>(null);

  useEffect(() => {
    if (viewMode === 'day') calendarRef.current?.updateDate(viewDate);
  }, [viewDate, viewMode]);

  const handlePrev = useCallback(() => {
    setViewDate((d) => {
      const next = new Date(d);
      next.setDate(1);
      if (viewMode === 'day') next.setMonth(next.getMonth() - 1);
      else if (viewMode === 'month') next.setFullYear(next.getFullYear() - 1);
      else next.setFullYear(next.getFullYear() - 10);
      return next;
    });
  }, [viewMode]);

  const handleNext = useCallback(() => {
    setViewDate((d) => {
      const next = new Date(d);
      next.setDate(1);
      if (viewMode === 'day') next.setMonth(next.getMonth() + 1);
      else if (viewMode === 'month') next.setFullYear(next.getFullYear() + 1);
      else next.setFullYear(next.getFullYear() + 10);
      return next;
    });
  }, [viewMode]);

  const goToToday = useCallback(() => {
    setViewDate(new Date());
    setViewMode('day');
  }, []);

  const handleMonthSelect = useCallback((month: number) => {
    setViewDate((d) => {
      const next = new Date(d);
      next.setDate(1);
      next.setMonth(month);
      return next;
    });
    setViewMode('day');
  }, []);

  const handleYearSelect = useCallback((year: number) => {
    setViewDate((d) => {
      const next = new Date(d);
      next.setDate(1);
      next.setFullYear(year);
      return next;
    });
    setViewMode('month');
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const decadeStart = getDecadeStart(year);

  const headerTitle =
    viewMode === 'day' ? (
      <div className='flex items-center gap-1'>
        <GhostButton
          className='rounded-sm! px-0! py-0! text-label-lg font-semibold text-on-surface hover:bg-transparent! hover:text-primary'
          onClick={() => setViewMode('month')}>
          {MONTH_NAMES[month]}
        </GhostButton>
        <GhostButton
          className='rounded-sm! px-0! py-0! text-label-lg font-semibold text-primary hover:bg-transparent! hover:opacity-70'
          onClick={() => setViewMode('year')}>
          {year}
        </GhostButton>
      </div>
    ) : viewMode === 'month' ? (
      <GhostButton
        className='rounded-sm! px-0! py-0! text-label-lg font-semibold text-on-surface hover:bg-transparent! hover:text-primary'
        onClick={() => setViewMode('year')}>
        {year}
      </GhostButton>
    ) : (
      <span className='text-label-lg font-semibold text-on-surface'>
        {decadeStart}–{decadeStart + 9}
      </span>
    );

  return (
    <div className='flex flex-col gap-3'>
      <Toolbar
        align='center'
        title={headerTitle}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={goToToday}
      />
      {viewMode === 'day' && (
        <MonthCalendar
          ref={calendarRef}
          hasMonthName={false}
          defaultDate={defaultDate}
          labelFormat='short'
          minDate={minDate}
          onDayClick={onDayClick}
        />
      )}
      {viewMode === 'month' && (
        <MonthPicker selectedMonth={month} onMonthClick={handleMonthSelect} />
      )}
      {viewMode === 'year' && (
        <YearPicker
          selectedYear={year}
          onYearClick={handleYearSelect}
        />
      )}
    </div>
  );
}
