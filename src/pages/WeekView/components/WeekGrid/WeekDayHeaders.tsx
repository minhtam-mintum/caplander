import { cn } from 'app/utils/cn';
import { dayToDateStr } from 'app/pages/WeekView/utils';
import { WEEK_DAY_SHORT } from 'app/pages/WeekView/const';

interface IWeekDayHeadersProps {
  weekDays: Date[];
}

export const WeekDayHeaders = ({ weekDays }: IWeekDayHeadersProps) => {
  const todayStr = dayToDateStr(new Date());
  return (
    <div className='flex shrink-0'>
      {weekDays.map((day) => {
        const dateStr = dayToDateStr(day);
        const isToday = dateStr === todayStr;
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        return (
          <div
            key={dateStr}
            className={cn(
              'flex-1 min-w-24 h-14 border-b border-outline-variant border-l first:border-l-0 flex flex-col items-center justify-center gap-0.5',
              isToday && 'border-t-2 border-t-primary',
              isWeekend && 'bg-surface-container-low/40',
            )}>
            <span className='text-label-sm text-on-surface-variant'>
              {WEEK_DAY_SHORT[day.getDay()]}
            </span>
            <span
              className={cn(
                'text-body-md font-semibold w-7 h-7 flex items-center justify-center rounded-full',
                isToday ? 'bg-primary text-on-primary' : 'text-on-surface',
              )}>
              {day.getDate()}
            </span>
          </div>
        );
      })}
      <div
        aria-hidden='true'
        className='w-(--week-scrollbar-gutter) shrink-0 border-b border-outline-variant'
      />
    </div>
  );
};
