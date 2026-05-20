import type { DayCalendarEvent } from 'app/types/event'
import {
  DAY_END_HOUR,
  DAY_HOUR_HEIGHT,
  DAY_START_HOUR,
  dayDurationToHeight,
  dayTimeToOffset,
  formatFullDate,
  formatHour24,
  generateDaySeedEvents,
  getDayCurrentOffset,
  getDayTitle,
} from 'app/utils/day'
import { dayToDateStr } from 'app/utils/week'
import { NavigationControls } from 'app/components/molecules/NavigationControls'
import { DayEventCard } from 'app/components/molecules/DayEventCard'

const HOURS = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i)
const TOTAL_HEIGHT = HOURS.length * DAY_HOUR_HEIGHT

interface IDayCalendarProps {
  date: Date
  events?: DayCalendarEvent[]
  onPrevDay: () => void
  onNextDay: () => void
  onToday: () => void
}

export function DayCalendar({ date, events, onPrevDay, onNextDay, onToday }: IDayCalendarProps) {
  const resolvedEvents = events ?? generateDaySeedEvents(date)
  const todayStr = dayToDateStr(new Date())
  const dateStr = dayToDateStr(date)
  const isToday = dateStr === todayStr
  const currentOffset = getDayCurrentOffset()

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-headline-xl text-on-surface'>{getDayTitle(date)}</h1>
          <p className='text-body-lg text-on-surface-variant'>{formatFullDate(date)}</p>
        </div>
        <NavigationControls onPrev={onPrevDay} onNext={onNextDay} onToday={onToday} />
      </div>

      {/* Time grid */}
      <div className='relative flex'>
        {/* Time labels column */}
        <div className='w-16 shrink-0'>
          {HOURS.map((h) => (
            <div key={h} className='flex items-start justify-end pr-3 pt-1' style={{ height: DAY_HOUR_HEIGHT }}>
              <span className='text-label-md text-on-surface-variant tabular-nums'>{formatHour24(h)}</span>
            </div>
          ))}
        </div>

        {/* Grid lines + events */}
        <div className='flex-1 relative border-t border-outline-variant/40'>
          {/* Hour rows with dashed lines + dots */}
          {HOURS.map((h) => (
            <div
              key={h}
              className='flex items-start border-b border-dashed border-outline-variant/40'
              style={{ height: DAY_HOUR_HEIGHT }}
            >
              <div className='w-2 h-2 rounded-full bg-outline-variant mt-0 -translate-y-1 shrink-0' />
            </div>
          ))}

          {/* Events layer */}
          <div className='absolute inset-0'>
            {resolvedEvents.map((event) => (
              <DayEventCard
                key={event.id}
                event={event}
                offsetTop={dayTimeToOffset(event.startTime)}
                height={dayDurationToHeight(event.startTime, event.endTime)}
              />
            ))}

            {/* Current time indicator */}
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
    </div>
  )
}
