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
import { forwardRef, useImperativeHandle, useState } from 'react';
export interface IMonthCalendarHandle {
  updateDate: (newDate: Date) => void;
}
interface IMonthCalendarProps {
  defaultDate?: Date;
  countByDate?: Record<string, number>;
  minDate?: string;
  labelFormat?: DayLabelFormat;
  weekStart?: WeekStart;
  classDayLabel?: string;
  classMonthName?: string;
  hasMonthName?: boolean;
  onDayClick?: (dateStr: string) => void;
}
export const MonthCalendar = forwardRef<IMonthCalendarHandle, IMonthCalendarProps>(
  function MonthCalendar(
    {
      defaultDate,
      countByDate = {},
      minDate,
      labelFormat = 'min',
      weekStart,
      classDayLabel,
      classMonthName,
      hasMonthName = true,
      onDayClick,
    }: IMonthCalendarProps,
    ref,
  ) {
    const [date, setDate] = useState(defaultDate ?? new Date());
    const year = date.getFullYear();
    const month = date.getMonth();
    const dayLabels = getDayLabels(labelFormat, weekStart);
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month, weekStart);
    useImperativeHandle(
      ref,
      () => ({
        updateDate: setDate,
      }),
      [],
    );
    const cells: Array<{ day: number | null }> = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: null });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });
    while (cells.length % 7 !== 0) cells.push({ day: null });

    return (
      <div className='@container bg-surface-container-lowest rounded-lg p-3 flex flex-col gap-2'>
        {hasMonthName && (
          <h3 className={cn('text-body-md @[320px]:text-body-lg font-semibold text-on-surface', classMonthName)}>
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
                isSelected={!!defaultDate && toDateStr(defaultDate.getFullYear(), defaultDate.getMonth(), defaultDate.getDate()) === toDateStr(year, month, cell.day)}
                isDisabled={!!minDate && toDateStr(year, month, cell.day) < minDate}
                onClick={
                  onDayClick ? () => onDayClick(toDateStr(year, month, cell.day!)) : undefined
                }
              />
            ),
          )}
        </div>
      </div>
    );
  },
);
