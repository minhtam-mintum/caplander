import { forwardRef, useImperativeHandle, useLayoutEffect, useState } from 'react'
import type { DayCalendarEvent } from 'app/types/event'
import {
  DAY_END_HOUR,
  DAY_HOUR_HEIGHT,
  DAY_START_HOUR,
  dayDurationToHeight,
  dayTimeToOffset,
  formatHour24,
  generateDaySeedEvents,
  getDayCurrentOffset,
} from 'app/utils/day'
import { dayToDateStr } from 'app/utils/week'
import { DayEventCard } from 'app/components/molecules/DayEventCard'

const HOURS = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i)
const TOTAL_HEIGHT = HOURS.length * DAY_HOUR_HEIGHT

export interface IDayCalendarHandle {
  prev: () => void;
  next: () => void;
  goToday: () => void;
}

interface IDayCalendarProps {
  events?: DayCalendarEvent[];
  onDateChange?: (date: Date) => void;
}

export const DayCalendar = forwardRef<IDayCalendarHandle, IDayCalendarProps>(
  function DayCalendar({ events, onDateChange }, ref) {
    const [date, setDate] = useState(new Date())

    useImperativeHandle(ref, () => ({
      prev:    () => setDate((d) => { const n = new Date(d); n.setDate(d.getDate() - 1); return n }),
      next:    () => setDate((d) => { const n = new Date(d); n.setDate(d.getDate() + 1); return n }),
      goToday: () => setDate(new Date()),
    }), [])

    useLayoutEffect(() => { onDateChange?.(date) }, [date, onDateChange])

    const resolvedEvents = events ?? generateDaySeedEvents(date)
    const todayStr = dayToDateStr(new Date())
    const dateStr = dayToDateStr(date)
    const isToday = dateStr === todayStr
    const currentOffset = getDayCurrentOffset()

    return (
      <div className='relative flex'>
        <div className='w-16 shrink-0'>
          {HOURS.map((h) => (
            <div key={h} className='flex items-start justify-end pr-3 pt-1' style={{ height: DAY_HOUR_HEIGHT }}>
              <span className='text-label-md text-on-surface-variant tabular-nums'>{formatHour24(h)}</span>
            </div>
          ))}
        </div>

        <div className='flex-1 relative border-t border-outline-variant/40'>
          {HOURS.map((h) => (
            <div
              key={h}
              className='flex items-start border-b border-dashed border-outline-variant/40'
              style={{ height: DAY_HOUR_HEIGHT }}
            >
              <div className='w-2 h-2 rounded-full bg-outline-variant mt-0 -translate-y-1 shrink-0' />
            </div>
          ))}

          <div className='absolute inset-0'>
            {resolvedEvents.map((event) => (
              <DayEventCard
                key={event.id}
                event={event}
                offsetTop={dayTimeToOffset(event.startTime)}
                height={dayDurationToHeight(event.startTime, event.endTime)}
              />
            ))}

            {isToday && currentOffset >= 0 && currentOffset <= TOTAL_HEIGHT && (
              <div
                className='absolute inset-x-0 flex items-center pointer-events-none z-10'
                style={{ top: currentOffset }}
              >
                <div className='w-3 h-3 rounded-full bg-primary shrink-0 -ml-1.5' />
                <div className='flex-1 border-t-2 border-primary' />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
)
