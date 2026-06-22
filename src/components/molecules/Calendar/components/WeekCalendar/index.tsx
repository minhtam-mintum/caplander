import { CalendarDayCell } from 'app/components/atoms/CalendarDayCell';
import { isToday, toDateStr } from 'app/utils/calendar';
import { cn } from 'app/utils/cn';
import {
  type IRenderDayProps,
  type IWeekCalendarProps,
} from 'app/components/molecules/Calendar/types';
export type { IRenderDayProps, IWeekCell } from 'app/components/molecules/Calendar/types';

export function WeekCalendar({
  cells,
  defaultDate,
  minDate,
  highlightToday = true,
  onDayClick,
  renderDay,
  overlay,
  classGrid,
  isLastRow,
}: IWeekCalendarProps) {
  return (
    <div className='relative'>
      <div className={cn('grid grid-cols-7 gap-0.5', classGrid)}>
        {cells.map((cell, di) => {
          const cellIsDisabled =
            !!minDate && new Date(Date.UTC(cell.year, cell.month, cell.day)) < minDate;
          const dayProps: IRenderDayProps = {
            day: cell.day,
            year: cell.year,
            month: cell.month,
            isCurrentMonth: cell.isCurrentMonth,
            isToday:
              highlightToday && cell.isCurrentMonth && isToday(cell.year, cell.month, cell.day),
            isSelected:
              cell.isCurrentMonth &&
              !!defaultDate &&
              toDateStr(
                defaultDate.getFullYear(),
                defaultDate.getMonth(),
                defaultDate.getDate(),
              ) === toDateStr(cell.year, cell.month, cell.day),
            isDisabled: cellIsDisabled,
            onClick:
              onDayClick && !cellIsDisabled
                ? () => onDayClick(new Date(Date.UTC(cell.year, cell.month, cell.day)))
                : undefined,
            isLastRow,
          };
          return renderDay ? (
            <div key={di}>{renderDay(dayProps)}</div>
          ) : (
            <CalendarDayCell
              key={di}
              day={dayProps.day}
              isToday={dayProps.isToday}
              isSelected={dayProps.isSelected}
              isDisabled={dayProps.isDisabled}
              onClick={dayProps.onClick}
            />
          );
        })}
      </div>
      {overlay}
    </div>
  );
}
