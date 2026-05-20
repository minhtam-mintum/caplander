import { Clock, Users } from 'lucide-react'
import type { DayCalendarEvent } from 'app/types/event'
import { formatTimeRange } from 'app/utils/week'
import { Badge } from 'app/components/atoms/Badge'
import { cn } from 'app/utils/cn'

const accentBorder: Record<NonNullable<DayCalendarEvent['variant']>, string> = {
  primary:   'border-l-primary',
  secondary: 'border-l-secondary',
  tertiary:  'border-l-tertiary',
  surface:   'border-l-outline-variant',
}

interface IDayEventCardProps {
  event: DayCalendarEvent
  offsetTop: number
  height: number
  className?: string
}

export function DayEventCard({ event, offsetTop, height, className }: IDayEventCardProps) {
  const border = accentBorder[event.variant ?? 'secondary']

  if (event.isPill) {
    return (
      <div
        className='absolute inset-x-0 flex items-center justify-center pointer-events-none'
        style={{ top: offsetTop }}
      >
        <span className='bg-surface-container text-on-surface-variant text-label-sm px-4 py-1 rounded-full border border-outline-variant'>
          {event.title}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'absolute inset-x-0 mx-1 rounded-lg border border-outline-variant bg-surface-container-lowest border-l-4 px-4 py-3 flex flex-col gap-2 overflow-hidden cursor-pointer hover:shadow-sm transition-shadow',
        border,
        className,
      )}
      style={{ top: offsetTop + 2, height: Math.max(height - 4, 32) }}
    >
      {/* Title row */}
      <div className='flex items-start justify-between gap-2'>
        <p className='text-body-md font-semibold text-on-surface leading-tight'>{event.title}</p>
        {event.tag && (
          <Badge
            label={event.tag}
            variant={event.tagVariant}
            icon={event.tagVariant === 'error' ? '!' : undefined}
          />
        )}
      </div>

      {/* Description */}
      {event.description && height >= 100 && (
        <p className='text-body-md text-on-surface-variant line-clamp-2'>{event.description}</p>
      )}

      {/* Footer */}
      {height >= 64 && (
        <div className='flex items-center gap-4 text-label-sm text-on-surface-variant mt-auto'>
          <span className='flex items-center gap-1'>
            <Clock size={12} />
            {formatTimeRange(event.startTime, event.endTime)}
            {event.duration && ` (${event.duration})`}
          </span>
          {event.attendees && (
            <span className='flex items-center gap-1'>
              <Users size={12} />
              {event.attendees}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
