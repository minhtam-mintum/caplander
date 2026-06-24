import { memo, useCallback } from 'react';
import { GhostButton } from 'app/components/molecules/Buttons/GhostButton';
import { dayToDateStr } from 'app/pages/WeekView/utils';
import { cn } from 'app/utils/cn';

interface IWeekPickerDayProps {
  day: number;
  isDisabled: boolean;
  isToday: boolean;
  month: number;
  onDateSelect: (date: Date) => void;
  selectedDateKey: string;
  selectedWeekEndKey: string;
  selectedWeekKeys: Set<string>;
  selectedWeekStartKey: string;
  year: number;
}

export const WeekPickerDay = memo(function WeekPickerDay({
  day,
  isDisabled,
  isToday,
  month,
  onDateSelect,
  selectedDateKey,
  selectedWeekEndKey,
  selectedWeekKeys,
  selectedWeekStartKey,
  year,
}: IWeekPickerDayProps) {
  const date = new Date(year, month, day);
  const dateKey = dayToDateStr(date);
  const isSelected = dateKey === selectedDateKey;
  const isInSelectedWeek = selectedWeekKeys.has(dateKey);
  const isSelectedWeekStart = dateKey === selectedWeekStartKey;
  const isSelectedWeekEnd = dateKey === selectedWeekEndKey;
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  const handleClick = useCallback(() => {
    onDateSelect(new Date(Date.UTC(year, month, day)));
  }, [day, month, onDateSelect, year]);

  return (
    <div
      className={cn(
        'flex h-9 items-center justify-center',
        isInSelectedWeek && 'bg-primary',
        isSelectedWeekStart && 'rounded-l-lg',
        isSelectedWeekEnd && 'rounded-r-lg',
      )}>
      <GhostButton
        disabled={isDisabled}
        onClick={isDisabled ? undefined : handleClick}
        className={cn(
          'size-9! justify-center rounded-none! px-0! py-0! text-body-md transition-colors',
          isInSelectedWeek
            ? 'font-bold text-on-primary! hover:bg-primary/90!'
            : isDisabled
              ? 'cursor-default text-on-surface-variant/35'
              : 'rounded-lg! text-on-surface hover:bg-surface-container-low!',
          !isInSelectedWeek && !isDisabled && isWeekend && 'text-error',
          !isInSelectedWeek && isToday && !isSelected && 'font-bold ring-1 ring-primary/50',
          isSelectedWeekStart && 'rounded-l-lg!',
          isSelectedWeekEnd && 'rounded-r-lg!',
        )}>
        {day}
      </GhostButton>
    </div>
  );
});
