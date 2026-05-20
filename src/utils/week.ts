import { CalendarEvent } from 'app/types/event';
import type { WeekStart } from 'app/utils/calendar';
import { toDateStr } from 'app/utils/calendar';

export const HOUR_HEIGHT = 64; // px per hour
export const START_HOUR = 8;
export const END_HOUR = 20;

export const WEEK_DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getWeekDays(refDate: Date, weekStart: WeekStart = 1): Date[] {
  const day = refDate.getDay();
  const diff = (day - weekStart + 7) % 7;
  const start = new Date(refDate);
  start.setDate(refDate.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function formatWeekRange(days: Date[]): string {
  const s = days[0];
  const e = days[6];
  const year = e.getFullYear();
  const sm = s.toLocaleDateString('en-US', { month: 'short' });
  const em = e.toLocaleDateString('en-US', { month: 'short' });
  if (sm === em) return `${sm} ${s.getDate()} - ${e.getDate()}, ${year}`;
  return `${sm} ${s.getDate()} - ${em} ${e.getDate()}, ${year}`;
}

export function formatHour(h: number): string {
  if (h === 0 || h === 24) return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export function formatTimeRange(start: string, end: string): string {
  const fmt = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const suffix = h < 12 ? 'AM' : 'PM';
    const hour = h % 12 || 12;
    return m === 0 ? `${hour} ${suffix}` : `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
  };
  return `${fmt(start)} - ${fmt(end)}`;
}

export function timeToOffset(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h * 60 + m - START_HOUR * 60) * (HOUR_HEIGHT / 60);
}

export function durationToHeight(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em - (sh * 60 + sm)) * (HOUR_HEIGHT / 60);
}

export function dayToDateStr(d: Date): string {
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getCurrentTimeOffset(): number {
  const now = new Date();
  return timeToOffset(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`);
}

export function generateWeekSeedEvents(weekDays: Date[]): CalendarEvent[] {
  const [mon, tue, wed, thu, fri] = weekDays.map(dayToDateStr);
  return [
    {
      id: 'e1',
      title: 'Q3 Planning Sync',
      date: tue,
      startTime: '09:00',
      endTime: '10:30',
      variant: 'secondary',
    },
    {
      id: 'e2',
      title: 'Design Review',
      date: wed,
      startTime: '10:00',
      endTime: '11:00',
      variant: 'primary',
    },
    {
      id: 'e3',
      title: 'Client Call',
      date: thu,
      startTime: '11:00',
      endTime: '12:00',
      variant: 'tertiary',
    },
    {
      id: 'e4',
      title: 'Lunch',
      date: mon,
      startTime: '12:00',
      endTime: '13:00',
      variant: 'surface',
    },
    {
      id: 'e5',
      title: 'Lunch',
      date: tue,
      startTime: '12:00',
      endTime: '13:00',
      variant: 'surface',
    },
    {
      id: 'e6',
      title: 'Lunch',
      date: wed,
      startTime: '12:00',
      endTime: '13:00',
      variant: 'surface',
    },
    {
      id: 'e7',
      title: 'Lunch',
      date: thu,
      startTime: '12:00',
      endTime: '13:00',
      variant: 'surface',
    },
    {
      id: 'e8',
      title: 'Lunch',
      date: fri,
      startTime: '12:00',
      endTime: '13:00',
      variant: 'surface',
    },
  ];
}
