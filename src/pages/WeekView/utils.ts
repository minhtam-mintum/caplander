import type { WeekStart } from 'app/utils/calendar';
import { toDateStr } from 'app/utils/calendar';
import { DAY_MS } from 'app/pages/MonthView/utils';
import type { IEvent } from 'app/store/slices/eventSlice';

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

export function dayToDateStr(d: Date): string {
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

export function layoutTimedEvents(
  events: IEvent[],
): Map<string, { col: number; totalCols: number }> {
  if (events.length === 0) return new Map();

  const sorted = [...events].sort((a, b) => a.start - b.start || b.end - a.end);
  const colEnds: number[] = [];
  const eventToCol = new Map<string, number>();

  for (const ev of sorted) {
    let col = colEnds.findIndex((end) => end <= ev.start);
    if (col === -1) col = colEnds.length;
    colEnds[col] = ev.end;
    eventToCol.set(ev.id, col);
  }

  // Union-find to group transitively overlapping events
  const n = sorted.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  function find(i: number): number {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  }
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (sorted[i].end > sorted[j].start && sorted[j].end > sorted[i].start) {
        const ri = find(i), rj = find(j);
        if (ri !== rj) parent[ri] = rj;
      }
    }
  }

  const compMaxCol = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    const col = eventToCol.get(sorted[i].id) ?? 0;
    compMaxCol.set(root, Math.max(compMaxCol.get(root) ?? 0, col));
  }

  const result = new Map<string, { col: number; totalCols: number }>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    result.set(sorted[i].id, {
      col: eventToCol.get(sorted[i].id) ?? 0,
      totalCols: (compMaxCol.get(root) ?? 0) + 1,
    });
  }
  return result;
}

function padTwo(n: number): string {
  return String(n).padStart(2, '0');
}

export function toTimeString(h: number, m: number): string {
  return `${padTwo(h)}:${padTwo(m)}`;
}

export function clampHour(h: number, m: number, minH: number, maxH: number): [number, number] {
  const total = h * 60 + m;
  if (total <= minH * 60) return [minH, 0];
  if (total >= maxH * 60) return [maxH, 0];
  return [h, m];
}

export function isMultiDay(event: IEvent): boolean {
  return event.end - event.start >= DAY_MS;
}

// Events are stored as Date.UTC(...) + offsetMs, so extract time via UTC offset
export function msToUtcHM(ms: number): [number, number] {
  const offset = ((ms % DAY_MS) + DAY_MS) % DAY_MS;
  return [Math.floor(offset / 3600000), Math.floor((offset % 3600000) / 60000)];
}
