import type { CalendarEvent } from 'app/types/event'
import { formatTimeRange } from 'app/utils/week'
import { cn } from 'app/utils/cn'

const variantClass: Record<NonNullable<CalendarEvent['variant']>, string> = {
  primary:   'bg-primary text-on-primary',
  secondary: 'bg-secondary-container text-on-secondary-container',
  tertiary:  'bg-tertiary-container text-on-tertiary-container',
  surface:   'bg-surface-container-high text-on-surface',
}

interface IWeekEventCardProps {
  event: CalendarEvent
  offsetTop: number
  height: number
  className?: string
}

export function WeekEventCard({ event, offsetTop, height, className }: IWeekEventCardProps) {
  const colors = variantClass[event.variant ?? 'secondary']
  return (
    <div
      className={cn('absolute inset-x-1 rounded-md px-2 py-1 overflow-hidden cursor-pointer hover:brightness-95 transition-all', colors, className)}
      style={{ top: offsetTop, height: Math.max(height, 20) }}
    >
      <p className='text-label-md font-semibold truncate leading-tight'>{event.title}</p>
      {height >= 32 && (
        <p className='text-label-sm opacity-80 leading-tight'>{formatTimeRange(event.startTime, event.endTime)}</p>
      )}
    </div>
  )
}
