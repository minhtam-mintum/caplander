import { useCallback, useEffect, useMemo, useState } from 'react';
import { MonthCalendar } from 'app/components/molecules/Calendar/components/MonthCalendar';
import type { IRenderDayProps } from 'app/components/molecules/Calendar/types';
import { MonthPicker } from 'app/components/molecules/Calendar/components/MonthPicker';
import { YearPicker } from 'app/components/molecules/YearPicker';
import { getDecadeStart } from 'app/components/molecules/YearPicker/utils';
import { WEEK_START } from 'app/pages/WeekView/const';
import { dayToDateStr, getWeekDays } from 'app/pages/WeekView/utils';
import { cn } from 'app/utils/cn';
import { WeekPickerDay } from './WeekPickerDay';
import { WeekPickerHeader } from './WeekPickerHeader';
import { WeekPickerHeaderTitle } from './WeekPickerHeaderTitle';
import type { WeekPickerStep } from './types';

interface IWeekPickerDropdownProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function WeekPickerDropdown({ selectedDate, onDateSelect }: IWeekPickerDropdownProps) {
  const [viewDate, setViewDate] = useState(selectedDate);
  const [pickerStep, setPickerStep] = useState<WeekPickerStep>('day');
  const selectedWeekDays = useMemo(() => getWeekDays(selectedDate, WEEK_START), [selectedDate]);
  const selectedWeekKeys = useMemo(
    () => new Set(selectedWeekDays.map(dayToDateStr)),
    [selectedWeekDays],
  );
  const selectedWeekStartKey = dayToDateStr(selectedWeekDays[0]);
  const selectedWeekEndKey = dayToDateStr(selectedWeekDays[6]);
  const selectedDateKey = dayToDateStr(selectedDate);
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const viewMonthKey = `${viewYear}-${viewMonth}`;
  const decadeStart = getDecadeStart(viewYear);

  useEffect(() => {
    setViewDate(selectedDate);
    setPickerStep('day');
  }, [selectedDate]);

  const handleSelectMonth = (month: number) => {
    setViewDate((date) => new Date(date.getFullYear(), month, 1));
    setPickerStep('day');
  };

  const handleSelectYear = (year: number) => {
    setViewDate((date) => new Date(year, date.getMonth(), 1));
    setPickerStep('month');
  };

  const handlePrev = useCallback(() => {
    setViewDate((date) => {
      const next = new Date(date);
      next.setDate(1);
      if (pickerStep === 'day') next.setMonth(next.getMonth() - 1);
      else if (pickerStep === 'month') next.setFullYear(next.getFullYear() - 1);
      else next.setFullYear(next.getFullYear() - 10);
      return next;
    });
  }, [pickerStep]);

  const handleNext = useCallback(() => {
    setViewDate((date) => {
      const next = new Date(date);
      next.setDate(1);
      if (pickerStep === 'day') next.setMonth(next.getMonth() + 1);
      else if (pickerStep === 'month') next.setFullYear(next.getFullYear() + 1);
      else next.setFullYear(next.getFullYear() + 10);
      return next;
    });
  }, [pickerStep]);

  const renderDay = useCallback(
    (dayProps: IRenderDayProps) => {
      return (
        <WeekPickerDay
          day={dayProps.day}
          isDisabled={dayProps.isDisabled}
          isToday={dayProps.isToday}
          month={dayProps.month}
          onDateSelect={onDateSelect}
          selectedDateKey={selectedDateKey}
          selectedWeekEndKey={selectedWeekEndKey}
          selectedWeekKeys={selectedWeekKeys}
          selectedWeekStartKey={selectedWeekStartKey}
          year={dayProps.year}
        />
      );
    },
    [onDateSelect, selectedDateKey, selectedWeekEndKey, selectedWeekKeys, selectedWeekStartKey],
  );

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

  return (
    <div className='absolute left-0 top-full mt-2 z-20 w-80 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lg overflow-hidden p-3'>
      <div className='flex flex-col gap-4'>
        <WeekPickerHeader
          title={
            <WeekPickerHeaderTitle
              decadeStart={decadeStart}
              pickerStep={pickerStep}
              setPickerStep={setPickerStep}
              viewMonth={viewMonth}
              viewYear={viewYear}
            />
          }
          onPrev={handlePrev}
          onNext={handleNext}
        />
        {pickerStep === 'day' && (
          <MonthCalendar
            key={viewMonthKey}
            defaultDate={viewDate}
            hasMonthName={false}
            labelFormat='short'
            classCard='bg-transparent p-0 rounded-none gap-3'
            classInner='gap-1'
            classDayLabelRow='gap-x-0 gap-y-1'
            classWeekGrid='gap-x-0 gap-y-1'
            onDayClick={onDateSelect}
            renderDay={renderDay}
            renderDayLabel={renderDayLabel}
          />
        )}
        {pickerStep === 'month' && (
          <MonthPicker selectedMonth={viewMonth} onMonthClick={handleSelectMonth} />
        )}
        {pickerStep === 'year' && (
          <YearPicker selectedYear={viewYear} onYearClick={handleSelectYear} />
        )}
      </div>
    </div>
  );
}
