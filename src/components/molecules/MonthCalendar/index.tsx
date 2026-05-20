import { CalendarDayCell } from 'app/components/atoms/CalendarDayCell';
import { DayLabel } from 'app/components/atoms/DayLabel';
import {
  type DayLabelFormat,
  getDayLabels,
  getDaysInMonth,
  getFirstDayOfMonth,
  isToday,
  MONTH_NAMES,
  toDateStr,
  WeekStart,
} from 'app/utils/calendar';
import { cn } from 'app/utils/cn';

interface IMonthCalendarProps {
  year: number;
  month: number;
  countByDate?: Record<string, number>;
  labelFormat?: DayLabelFormat;
  weekStart?: WeekStart;
  classDayLabel?: string;
  classMonthName?: string;
  hasMonthName?: boolean;
  onDayClick?: (dateStr: string) => void;
}

export function MonthCalendar({
  year,
  month,
  countByDate = {},
  labelFormat = 'min',
  weekStart,
  classDayLabel,
  classMonthName,
  hasMonthName = true,
  onDayClick,
}: IMonthCalendarProps) {
  const dayLabels = getDayLabels(labelFormat, weekStart);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month, weekStart);

  const cells: Array<{ day: number | null }> = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });
  while (cells.length % 7 !== 0) cells.push({ day: null });

  return (
    <div className='bg-surface-container-lowest rounded-lg p-3 flex flex-col gap-2'>
      {hasMonthName && (
        <h3 className={cn('text-body-md font-semibold text-on-surface', classMonthName)}>
          {MONTH_NAMES[month]}
        </h3>
      )}
      <div className='grid grid-cols-7 gap-px'>
        {dayLabels.map((label, i) => (
          <DayLabel classDayLabel={classDayLabel} key={i} label={label} />
        ))}
        {cells.map((cell, i) =>
          cell.day === null ? (
            <div key={i} className='aspect-square' />
          ) : (
            <CalendarDayCell
              key={i}
              day={cell.day}
              count={countByDate[toDateStr(year, month, cell.day)] ?? 0}
              isToday={isToday(year, month, cell.day)}
              onClick={onDayClick ? () => onDayClick(toDateStr(year, month, cell.day!)) : undefined}
            />
          ),
        )}
      </div>
    </div>
  );
}
