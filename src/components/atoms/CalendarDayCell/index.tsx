interface ICalendarDayCellProps {
  day: number
  count?: number
  isToday?: boolean
  isEmpty?: boolean
  onClick?: () => void
}

function heatmapClass(count: number): { bg: string; text: string } {
  if (count === 0) return { bg: 'bg-surface-container-lowest', text: 'text-on-surface' }
  if (count === 1) return { bg: 'bg-primary/12', text: 'text-on-surface' }
  if (count <= 3) return { bg: 'bg-primary/28', text: 'text-on-surface' }
  if (count <= 5) return { bg: 'bg-primary/50', text: 'text-on-primary' }
  if (count <= 7) return { bg: 'bg-primary/72', text: 'text-on-primary' }
  return { bg: 'bg-primary', text: 'text-on-primary' }
}

export function CalendarDayCell({ day, count = 0, isToday = false, isEmpty = false, onClick }: ICalendarDayCellProps) {
  if (isEmpty) return <div />

  const { bg, text } = isToday
    ? { bg: 'bg-primary', text: 'text-on-primary' }
    : heatmapClass(count)

  const hasDot = !isToday && count > 0

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center aspect-square rounded-sm ${bg} ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-primary/40 transition-shadow' : ''}`}
    >
      <span className={`text-label-sm leading-none ${text} ${isToday ? 'font-bold' : ''}`}>{day}</span>
      {hasDot && (
        <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary/40" />
      )}
    </div>
  )
}
