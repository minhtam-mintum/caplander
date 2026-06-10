import {
  getWeekDays,
  formatWeekRange,
  formatHour,
  dayToDateStr,
  layoutTimedEvents,
  toTimeString,
  clampHour,
  isMultiDay,
  msToUtcHM,
} from 'app/pages/WeekView/utils';
import { DAY_MS } from 'app/pages/MonthView/utils';
import type { IEvent } from 'app/store/slices/eventSlice';

function mkEvent(id: string, start: number, end: number): IEvent {
  return { id, name: id, start, end, alert: 0, label: '', notes: '' };
}

describe('getWeekDays', () => {
  it('returns exactly 7 days', () => {
    expect(getWeekDays(new Date(2024, 2, 15), 1)).toHaveLength(7);
  });

  it('first day is Monday when weekStart=1 (Mar 15 2024 is Friday)', () => {
    const days = getWeekDays(new Date(2024, 2, 15), 1);
    expect(days[0].getDay()).toBe(1); // Monday
  });

  it('last day is Sunday when weekStart=1', () => {
    const days = getWeekDays(new Date(2024, 2, 15), 1);
    expect(days[6].getDay()).toBe(0); // Sunday
  });

  it('first day is Sunday when weekStart=0', () => {
    const days = getWeekDays(new Date(2024, 2, 15), 0);
    expect(days[0].getDay()).toBe(0);
  });

  it('days are consecutive', () => {
    const days = getWeekDays(new Date(2024, 2, 15), 1);
    for (let i = 1; i < 7; i++) {
      expect(days[i].getTime() - days[i - 1].getTime()).toBe(DAY_MS);
    }
  });
});

describe('formatWeekRange', () => {
  it('shows single month when week stays within one month', () => {
    const days = getWeekDays(new Date(2024, 2, 15), 1); // Mar 11–17
    expect(formatWeekRange(days)).toMatch(/^Mar 11 - 17, 2024$/);
  });

  it('shows both months when week crosses a month boundary', () => {
    // weekStart=0, ref=Mar 31 → Sun Mar 31 to Sat Apr 6
    const days = getWeekDays(new Date(2024, 2, 31), 0);
    const result = formatWeekRange(days);
    expect(result).toMatch(/Mar/);
    expect(result).toMatch(/Apr/);
  });
});

describe('formatHour', () => {
  it('0 → "12 AM"', () => expect(formatHour(0)).toBe('12 AM'));
  it('12 → "12 PM"', () => expect(formatHour(12)).toBe('12 PM'));
  it('24 → "12 AM"', () => expect(formatHour(24)).toBe('12 AM'));
  it('9 → "9 AM"', () => expect(formatHour(9)).toBe('9 AM'));
  it('13 → "1 PM"', () => expect(formatHour(13)).toBe('1 PM'));
  it('23 → "11 PM"', () => expect(formatHour(23)).toBe('11 PM'));
});

describe('dayToDateStr', () => {
  it('formats as YYYY-MM-DD with padding', () => {
    expect(dayToDateStr(new Date(2024, 2, 5))).toBe('2024-03-05');
  });

  it('handles double-digit day and month', () => {
    expect(dayToDateStr(new Date(2024, 11, 31))).toBe('2024-12-31');
  });
});

describe('layoutTimedEvents', () => {
  it('returns empty map for no events', () => {
    expect(layoutTimedEvents([])).toEqual(new Map());
  });

  it('single event: col 0, totalCols 1', () => {
    const result = layoutTimedEvents([mkEvent('a', 0, 3_600_000)]);
    expect(result.get('a')).toEqual({ col: 0, totalCols: 1 });
  });

  it('non-overlapping events each get col 0, totalCols 1', () => {
    const result = layoutTimedEvents([
      mkEvent('a', 0, 1000),
      mkEvent('b', 2000, 3000),
    ]);
    expect(result.get('a')).toEqual({ col: 0, totalCols: 1 });
    expect(result.get('b')).toEqual({ col: 0, totalCols: 1 });
  });

  it('two overlapping events get different cols and totalCols 2', () => {
    const result = layoutTimedEvents([
      mkEvent('a', 0, 2000),
      mkEvent('b', 1000, 3000),
    ]);
    const a = result.get('a')!;
    const b = result.get('b')!;
    expect(a.col).not.toBe(b.col);
    expect(a.totalCols).toBe(2);
    expect(b.totalCols).toBe(2);
  });

  it('three mutually overlapping events get 3 distinct cols and totalCols 3', () => {
    const result = layoutTimedEvents([
      mkEvent('a', 0, 3000),
      mkEvent('b', 1000, 4000),
      mkEvent('c', 2000, 5000),
    ]);
    const cols = ['a', 'b', 'c'].map((id) => result.get(id)!.col);
    expect(new Set(cols).size).toBe(3);
    expect(result.get('a')!.totalCols).toBe(3);
  });

  it('adjacent (touching) events do not overlap', () => {
    // b starts exactly when a ends — not overlapping
    const result = layoutTimedEvents([
      mkEvent('a', 0, 1000),
      mkEvent('b', 1000, 2000),
    ]);
    expect(result.get('a')).toEqual({ col: 0, totalCols: 1 });
    expect(result.get('b')).toEqual({ col: 0, totalCols: 1 });
  });
});

describe('toTimeString', () => {
  it('pads hour and minute to two digits', () => expect(toTimeString(9, 5)).toBe('09:05'));
  it('handles double-digit values', () => expect(toTimeString(23, 59)).toBe('23:59'));
  it('midnight', () => expect(toTimeString(0, 0)).toBe('00:00'));
});

describe('clampHour', () => {
  it('clamps to min when below', () => expect(clampHour(0, 0, 6, 22)).toEqual([6, 0]));
  it('clamps to max when above', () => expect(clampHour(23, 30, 6, 22)).toEqual([22, 0]));
  it('passes through when in range', () => expect(clampHour(10, 30, 6, 22)).toEqual([10, 30]));
  it('clamps at exact min boundary', () => expect(clampHour(6, 0, 6, 22)).toEqual([6, 0]));
  it('clamps at exact max boundary', () => expect(clampHour(22, 0, 6, 22)).toEqual([22, 0]));
});

describe('isMultiDay', () => {
  it('returns true when duration >= 24h', () => {
    expect(isMultiDay(mkEvent('a', 0, DAY_MS))).toBe(true);
  });

  it('returns true when duration > 24h', () => {
    expect(isMultiDay(mkEvent('a', 0, DAY_MS + 1))).toBe(true);
  });

  it('returns false for a same-day event', () => {
    expect(isMultiDay(mkEvent('a', 0, 3_600_000))).toBe(false);
  });
});

describe('msToUtcHM', () => {
  it('extracts hour and minute from milliseconds', () => {
    const ms = 9 * 3_600_000 + 30 * 60_000;
    expect(msToUtcHM(ms)).toEqual([9, 30]);
  });

  it('handles midnight (0)', () => {
    expect(msToUtcHM(0)).toEqual([0, 0]);
  });

  it('handles end of day (23:59)', () => {
    const ms = 23 * 3_600_000 + 59 * 60_000;
    expect(msToUtcHM(ms)).toEqual([23, 59]);
  });
});
