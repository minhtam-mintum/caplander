import type { CalendarEvent } from 'app/types/event';
import type { WeekStart } from 'app/utils/calendar';
import {
  END_HOUR,
  HOUR_HEIGHT,
  START_HOUR,
  WEEK_DAY_SHORT,
  dayToDateStr,
  durationToHeight,
  formatHour,
  formatWeekRange,
  generateWeekSeedEvents,
  getCurrentTimeOffset,
  getWeekDays,
  timeToOffset,
} from 'app/utils/week';
import { Button } from 'app/components/atoms/button';
import { WeekEventCard } from 'app/components/molecules/WeekEventCard';
import { NavigationControls } from 'app/components/molecules/NavigationControls';

const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const TOTAL_HEIGHT = HOURS.length * HOUR_HEIGHT;

interface IWeekCalendarProps {
  refDate: Date;
  events?: CalendarEvent[];
  weekStart?: WeekStart;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onFilter?: () => void;
}

export function WeekCalendar({
  refDate,
  events,
  weekStart = 1,
  onPrevWeek,
  onNextWeek,
  onToday,
  onFilter,
}: IWeekCalendarProps) {
  const weekDays = getWeekDays(refDate, weekStart);
  const resolvedEvents = events ?? generateWeekSeedEvents(weekDays);
  const todayStr = dayToDateStr(new Date());
  const currentOffset = getCurrentTimeOffset();

  const eventsByDate = resolvedEvents.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    (acc[e.date] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className='flex flex-col gap-4'>
      {/* Toolbar */}
      <div className='flex items-center justify-between'>
        <h2 className='text-headline-md text-on-surface'>{formatWeekRange(weekDays)}</h2>
        <div className='flex items-center gap-2'>
          <NavigationControls onPrev={onPrevWeek} onNext={onNextWeek} onToday={onToday} />
          {onFilter && (
            <Button variant='secondary' onClick={onFilter}>
              Filter
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className='flex rounded-lg border border-outline-variant overflow-hidden bg-surface-container-lowest'>
        {/* Time labels */}
        <div className='w-14 shrink-0 border-r border-outline-variant'>
          <div className='h-14 border-b border-outline-variant' />
          {HOURS.map((h) => (
            <div
              key={h}
              className='flex items-start justify-end pr-2 pt-1'
              style={{ height: HOUR_HEIGHT }}>
              <span className='text-label-sm text-on-surface-variant'>{formatHour(h)}</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className='flex flex-1 overflow-x-auto'>
          {weekDays.map((day, _) => {
            const dateStr = dayToDateStr(day);
            const isToday = dateStr === todayStr;
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            const dayEvents = eventsByDate[dateStr] ?? [];

            return (
              <div
                key={dateStr}
                className={`flex-1 min-w-24 flex flex-col border-l border-outline-variant first:border-l-0 ${isWeekend ? 'bg-surface-container-low/40' : ''}`}>
                {/* Day header */}
                <div
                  className={`h-14 border-b border-outline-variant flex flex-col items-center justify-center gap-0.5 ${isToday ? 'border-t-2 border-t-primary' : ''}`}>
                  <span className='text-label-sm text-on-surface-variant'>
                    {WEEK_DAY_SHORT[day.getDay()]}
                  </span>
                  <span
                    className={`text-body-md font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-on-primary' : 'text-on-surface'}`}>
                    {day.getDate()}
                  </span>
                </div>

                {/* Events area */}
                <div className='relative' style={{ height: TOTAL_HEIGHT }}>
                  {/* Hour grid lines */}
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className='absolute w-full border-b border-outline-variant/30'
                      style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
                    />
                  ))}

                  {/* Events */}
                  {dayEvents.map((event) => (
                    <WeekEventCard
                      key={event.id}
                      event={event}
                      offsetTop={timeToOffset(event.startTime)}
                      height={durationToHeight(event.startTime, event.endTime)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
