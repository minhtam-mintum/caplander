import { DayLabel } from 'app/components/atoms/DayLabel';
import { getDayLabels, getDaysInMonth, getFirstDayOfMonth, MONTH_NAMES } from 'app/utils/calendar';
import { cn } from 'app/utils/cn';
import { WeekCalendar } from 'app/components/molecules/Calendar/components/WeekCalendar';
import {
  type IMonthCalendarHandle,
  type IMonthCalendarProps,
  type IWeekCell,
} from 'app/components/molecules/Calendar/types';
import { forwardRef, useImperativeHandle, useState } from 'react';
export type {
  IMonthCalendarHandle,
  IRenderDayProps,
} from 'app/components/molecules/Calendar/types';
export const MonthCalendar = forwardRef<IMonthCalendarHandle, IMonthCalendarProps>(
  function MonthCalendar(
    {
      defaultDate,
      minDate,
      labelFormat = 'min',
      weekStart,
      classCard,
      classDayLabel,
      classMonthName,
      classInner,
      classDayLabelRow,
      classWeekGrid,
      hasMonthName = true,
      highlightToday = true,
      onDayClick,
      renderDay,
      renderDayLabel,
      renderOverlay,
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
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;

    const cells: IWeekCell[] = [];
    for (let i = firstDay - 1; i >= 0; i--)
      cells.push({
        day: daysInPrevMonth - i,
        year: prevYear,
        month: prevMonth,
        isCurrentMonth: false,
      });
    for (let d = 1; d <= daysInMonth; d++)
      cells.push({ day: d, year, month, isCurrentMonth: true });
    let nextDay = 1;
    while (cells.length % 7 !== 0)
      cells.push({ day: nextDay++, year: nextYear, month: nextMonth, isCurrentMonth: false });
    const weeks: IWeekCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    return (
      <div
        className={cn(
          '@container bg-surface-container-lowest rounded-lg p-3 flex flex-col gap-2',
          classCard,
        )}>
        {hasMonthName && (
          <h3
            className={cn(
              'text-body-md @[320px]:text-body-lg font-semibold text-on-surface',
              classMonthName,
            )}>
            {MONTH_NAMES[month]}
          </h3>
        )}
        <div className={cn('flex flex-col gap-0.5', classInner)}>
          <div className={cn('grid grid-cols-7 gap-0.5', classDayLabelRow)}>
            {dayLabels.map((label, i) =>
              renderDayLabel ? (
                renderDayLabel(label, i)
              ) : (
                <DayLabel classDayLabel={classDayLabel} key={i} label={label} />
              ),
            )}
          </div>
          {weeks.map((week, wi) => (
            <WeekCalendar
              key={wi}
              cells={week}
              isLastRow={wi + 1 === weeks.length}
              defaultDate={defaultDate}
              minDate={minDate}
              highlightToday={highlightToday}
              onDayClick={onDayClick}
              renderDay={renderDay}
              classGrid={classWeekGrid}
              overlay={renderOverlay?.(week, weeks)}
            />
          ))}
        </div>
      </div>
    );
  },
);
