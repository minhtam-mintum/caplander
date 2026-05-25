export type WeekStart = 0 | 1; // 0 = Sunday, 1 = Monday
export type DayLabelFormat = 'min' | 'short' | 'full';

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_LABELS_BY_FORMAT: Record<DayLabelFormat, string[]> = {
  min: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

export function getDayLabels(format: DayLabelFormat, weekStart: WeekStart = 1): string[] {
  const labels = DAY_LABELS_BY_FORMAT[format];
  return [...labels.slice(weekStart), ...labels.slice(0, weekStart)];
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number, weekStart: WeekStart = 1): number {
  const day = new Date(year, month, 1).getDay();
  return (day - weekStart + 7) % 7;
}

export function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function isToday(year: number, month: number, day: number): boolean {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
}

export function formatTime(ms: number): string {
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatDetailDate(date: Date): string {
  const weekday = DAY_LABELS_BY_FORMAT.short[date.getUTCDay()];
  const month = MONTH_NAMES[date.getUTCMonth()].slice(0, 3);
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  return `${weekday}, ${month} ${day}, ${year}`;
}
