import type { DayCalendarEvent } from 'app/types/event'
import { dayToDateStr } from 'app/utils/week'

export const DAY_HOUR_HEIGHT = 80   // px — taller rows than week view
export const DAY_START_HOUR = 8
export const DAY_END_HOUR = 20

export function formatHour24(h: number): string {
  return `${String(h).padStart(2, '0')}:00`
}

export function dayTimeToOffset(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return ((h * 60 + m) - DAY_START_HOUR * 60) * (DAY_HOUR_HEIGHT / 60)
}

export function dayDurationToHeight(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return ((eh * 60 + em) - (sh * 60 + sm)) * (DAY_HOUR_HEIGHT / 60)
}

export function getDayCurrentOffset(): number {
  const now = new Date()
  return dayTimeToOffset(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`)
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function getDayTitle(date: Date): string {
  const todayStr = dayToDateStr(new Date())
  const dateStr = dayToDateStr(date)
  if (dateStr === todayStr) return 'Today'
  const diff = Math.round((date.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

export function generateDaySeedEvents(date: Date): DayCalendarEvent[] {
  const dateStr = dayToDateStr(date)
  return [
    {
      id: 'd1',
      title: 'Q4 Strategic Planning Sync',
      date: dateStr,
      startTime: '09:00',
      endTime: '10:30',
      variant: 'primary',
      description: 'Review final budget allocations and finalize team OKRs before the all-hands presentation.',
      duration: '1h 30m',
      attendees: 'Leadership Team',
      tag: 'High Priority',
      tagVariant: 'error',
    },
    {
      id: 'd2',
      title: 'Design System Review',
      date: dateStr,
      startTime: '11:00',
      endTime: '12:00',
      variant: 'secondary',
      tag: 'Design',
      tagVariant: 'secondary',
    },
    {
      id: 'd3',
      title: 'Lunch Break',
      date: dateStr,
      startTime: '12:00',
      endTime: '13:00',
      variant: 'surface',
      isPill: true,
    },
  ]
}
