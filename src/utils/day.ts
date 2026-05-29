import { dayToDateStr } from 'app/pages/WeekView/utils';

export const DAY_HOUR_HEIGHT = 80; // px — taller rows than week view
export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 20;

export function formatHour24(h: number): string {
  return `${String(h).padStart(2, '0')}:00`;
}


export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDayTitle(date: Date): string {
  const todayStr = dayToDateStr(new Date());
  const dateStr = dayToDateStr(date);
  if (dateStr === todayStr) return 'Today';
  const diff = Math.round((date.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000);
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'long' });
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
