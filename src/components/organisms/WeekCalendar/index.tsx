import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useState } from 'react';
import type { CalendarEvent } from 'app/types/event';
import {
  END_HOUR,
  HOUR_HEIGHT,
  START_HOUR,
  WEEK_DAY_SHORT,
  dayToDateStr,
  durationToHeight,
  formatHour,
  generateWeekSeedEvents,
  getCurrentTimeOffset,
  getWeekDays,
  timeToOffset,
} from 'app/utils/week';
import { WeekEventCard } from 'app/components/molecules/WeekEventCard';

const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const TOTAL_HEIGHT = HOURS.length * HOUR_HEIGHT;
const WEEK_START = 1 as const;

export interface IWeekCalendarHandle {
  prev: () => void;
  next: () => void;
  goToday: () => void;
}

interface IWeekCalendarProps {
  events?: CalendarEvent[];
  onWeekChange?: (weekDays: Date[]) => void;
}

export const WeekCalendar = forwardRef<IWeekCalendarHandle, IWeekCalendarProps>(
  function WeekCalendar({ events, onWeekChange }, ref) {
    const [refDate, setRefDate] = useState(new Date());

    useImperativeHandle(ref, () => ({
      prev:    () => setRefDate((d) => { const n = new Date(d); n.setDate(d.getDate() - 7); return n; }),
      next:    () => setRefDate((d) => { const n = new Date(d); n.setDate(d.getDate() + 7); return n; }),
      goToday: () => setRefDate(new Date()),
    }), []);

    const weekDays = useMemo(() => getWeekDays(refDate, WEEK_START), [refDate]);

    useLayoutEffect(() => { onWeekChange?.(weekDays) }, [weekDays, onWeekChange]);

    const resolvedEvents = events ?? generateWeekSeedEvents(weekDays);
    const todayStr = dayToDateStr(new Date());
    const currentOffset = getCurrentTimeOffset();

    const eventsByDate = resolvedEvents.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
      (acc[e.date] ??= []).push(e);
      return acc;
    }, {});

    return (
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
          {weekDays.map((day) => {
            const dateStr = dayToDateStr(day);
            const isToday = dateStr === todayStr;
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            const dayEvents = eventsByDate[dateStr] ?? [];

            return (
              <div
                key={dateStr}
                className={`flex-1 min-w-24 flex flex-col border-l border-outline-variant first:border-l-0 ${isWeekend ? 'bg-surface-container-low/40' : ''}`}>
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

                <div className='relative' style={{ height: TOTAL_HEIGHT }}>
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className='absolute w-full border-b border-outline-variant/30'
                      style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
                    />
                  ))}
                  {dayEvents.map((event) => (
                    <WeekEventCard
                      key={event.id}
                      event={event}
                      offsetTop={timeToOffset(event.startTime)}
                      height={durationToHeight(event.startTime, event.endTime)}
                    />
                  ))}

                  {isToday && currentOffset >= 0 && currentOffset <= TOTAL_HEIGHT && (
                    <div
                      className='absolute inset-x-0 flex items-center pointer-events-none z-10'
                      style={{ top: currentOffset }}
                    >
                      <div className='w-2 h-2 rounded-full bg-primary shrink-0 -ml-1' />
                      <div className='flex-1 border-t-2 border-primary' />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
)
