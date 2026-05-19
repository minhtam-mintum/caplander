export type EventVariant = 'primary' | 'secondary' | 'tertiary' | 'surface'

export interface CalendarEvent {
  id: string
  title: string
  date: string       // YYYY-MM-DD
  startTime: string  // HH:MM
  endTime: string    // HH:MM
  variant?: EventVariant
}
