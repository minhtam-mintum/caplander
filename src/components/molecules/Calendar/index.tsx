import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  MonthCalendar,
  type IMonthCalendarHandle,
  type IRenderDayProps,
} from 'app/components/molecules/Calendar/components/MonthCalendar';
import { MonthPicker } from 'app/components/molecules/Calendar/components/MonthPicker';
import { GhostButton } from 'app/components/molecules/Buttons/GhostButton';
import { IconButton } from 'app/components/molecules/Buttons/IconButton';
import { YearPicker } from 'app/components/molecules/YearPicker';
import { getDecadeStart } from 'app/components/molecules/YearPicker/utils';
import { MONTH_NAMES } from 'app/utils/calendar';
import { cn } from 'app/utils/cn';

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

  const renderDay = useCallback((dayProps: IRenderDayProps) => {
    const date = new Date(dayProps.year, dayProps.month, dayProps.day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    return (
      <GhostButton
        disabled={dayProps.isDisabled}
        onClick={dayProps.onClick}
        className={cn(
          'mx-auto size-9! justify-center rounded-lg! px-0! py-0! text-body-md transition-colors',
          dayProps.isDisabled
            ? 'cursor-default text-on-surface-variant/35'
            : 'text-on-surface hover:bg-surface-container-low!',
          !dayProps.isDisabled && isWeekend && 'text-error',
          dayProps.isToday && !dayProps.isSelected && 'font-bold ring-1 ring-primary/50',
          dayProps.isSelected && 'bg-primary! text-on-primary! font-bold hover:bg-primary/90!',
        )}>
        {dayProps.day}
      </GhostButton>
    );
  }, []);

  const renderDayLabel = useCallback((label: string, index: number) => {
    const isWeekend = index >= 5;
    return (
      <div className='flex h-8 items-center justify-center'>
        <span
          className={cn(
            'text-label-md font-bold text-on-surface-variant',
            isWeekend && 'text-error',
          )}>
          {label}
        </span>
      </div>
    );
  }, []);

  const headerTitle =
    viewMode === 'day' ? (
      <div className='flex items-center gap-1'>
        <GhostButton
          className='rounded-md! px-1.5! py-0.5! text-headline-md font-bold! text-on-surface hover:bg-primary-fixed/60! hover:text-primary!'
          onClick={() => setViewMode('month')}>
          {MONTH_NAMES[month]}
        </GhostButton>
        <GhostButton
          className='rounded-md! px-1.5! py-0.5! text-headline-md font-bold! text-on-surface hover:bg-primary-fixed/60! hover:text-primary!'
          onClick={() => setViewMode('year')}>
          {year}
        </GhostButton>
      </div>
    ) : viewMode === 'month' ? (
      <GhostButton
        className='rounded-md! px-1.5! py-0.5! text-headline-md font-bold! text-on-surface hover:bg-primary-fixed/60! hover:text-primary!'
        onClick={() => setViewMode('year')}>
        {year}
      </GhostButton>
    ) : (
      <span className='text-headline-md font-bold! text-on-surface'>
        {decadeStart}–{decadeStart + 9}
      </span>
    );

  return (
    <div className='flex flex-col gap-3'>
      <CalendarHeader
        title={headerTitle}
        onPrev={handlePrev}
        onNext={handleNext}
      />
      {viewMode === 'day' && (
        <MonthCalendar
          ref={calendarRef}
          hasMonthName={false}
          defaultDate={defaultDate}
          labelFormat='short'
          minDate={minDate}
          onDayClick={onDayClick}
          classCard='bg-transparent p-0 rounded-none gap-3'
          classInner='gap-1'
          classDayLabelRow='gap-1'
          classWeekGrid='gap-1'
          renderDay={renderDay}
          renderDayLabel={renderDayLabel}
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

interface ICalendarHeaderProps {
  title: ReactNode;
  onPrev: () => void;
  onNext: () => void;
}

function CalendarHeader({ title, onPrev, onNext }: ICalendarHeaderProps) {
  return (
    <div className='grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2'>
      <IconButton
        className='size-9! rounded-[10px]! text-on-surface hover:bg-surface-container-low!'
        aria-label='Previous'
        onClick={onPrev}>
        <ChevronLeft size={18} />
      </IconButton>
      <div className='justify-self-center'>{title}</div>
      <IconButton
        className='size-9! rounded-[10px]! text-on-surface hover:bg-surface-container-low!'
        aria-label='Next'
        onClick={onNext}>
        <ChevronRight size={18} />
      </IconButton>
    </div>
  );
}
