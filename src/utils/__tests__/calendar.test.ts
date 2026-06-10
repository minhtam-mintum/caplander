import {
  getDayLabels,
  getDaysInMonth,
  getFirstDayOfMonth,
  toDateStr,
  isToday,
  formatTime,
  formatDetailDate,
} from 'app/utils/calendar';

describe('getDayLabels', () => {
  it('short format starting Monday', () => {
    expect(getDayLabels('short', 1)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  });

  it('short format starting Sunday', () => {
    expect(getDayLabels('short', 0)).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  });

  it('min format has 7 entries', () => {
    expect(getDayLabels('min', 0)).toHaveLength(7);
  });

  it('full format starting Monday', () => {
    expect(getDayLabels('full', 1)[0]).toBe('Monday');
    expect(getDayLabels('full', 1)[6]).toBe('Sunday');
  });
});

describe('getDaysInMonth', () => {
  it('January has 31 days', () => expect(getDaysInMonth(2024, 0)).toBe(31));
  it('April has 30 days', () => expect(getDaysInMonth(2024, 3)).toBe(30));
  it('February 2024 leap year has 29 days', () => expect(getDaysInMonth(2024, 1)).toBe(29));
  it('February 2023 non-leap year has 28 days', () => expect(getDaysInMonth(2023, 1)).toBe(28));
  it('December has 31 days', () => expect(getDaysInMonth(2024, 11)).toBe(31));
});

describe('getFirstDayOfMonth', () => {
  // 2024-01-01 is a Monday (day=1); weekStart=1 → offset (1-1+7)%7 = 0
  it('Jan 2024, weekStart=1 → offset 0', () => {
    expect(getFirstDayOfMonth(2024, 0, 1)).toBe(0);
  });

  // 2024-03-01 is a Friday (day=5); weekStart=1 → (5-1+7)%7 = 4
  it('Mar 2024, weekStart=1 → offset 4', () => {
    expect(getFirstDayOfMonth(2024, 2, 1)).toBe(4);
  });

  // 2024-01-01 is a Monday (day=1); weekStart=0 → (1-0+7)%7 = 1
  it('Jan 2024, weekStart=0 → offset 1', () => {
    expect(getFirstDayOfMonth(2024, 0, 0)).toBe(1);
  });

  // 2024-09-01 is a Sunday (day=0); weekStart=0 → 0
  it('Sep 2024, weekStart=0 → offset 0', () => {
    expect(getFirstDayOfMonth(2024, 8, 0)).toBe(0);
  });
});

describe('toDateStr', () => {
  it('pads single-digit month and day', () => expect(toDateStr(2024, 0, 5)).toBe('2024-01-05'));
  it('handles double-digit month and day', () => expect(toDateStr(2024, 11, 31)).toBe('2024-12-31'));
  it('pads month from 0-indexed', () => expect(toDateStr(2024, 9, 1)).toBe('2024-10-01'));
});

describe('isToday', () => {
  it('returns true for today', () => {
    const now = new Date();
    expect(isToday(now.getFullYear(), now.getMonth(), now.getDate())).toBe(true);
  });

  it('returns false for yesterday', () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    expect(isToday(d.getFullYear(), d.getMonth(), d.getDate())).toBe(false);
  });

  it('returns false for tomorrow', () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    expect(isToday(d.getFullYear(), d.getMonth(), d.getDate())).toBe(false);
  });
});

describe('formatTime', () => {
  it('0ms → "00:00"', () => expect(formatTime(0)).toBe('00:00'));
  it('1 hour → "01:00"', () => expect(formatTime(3_600_000)).toBe('01:00'));
  it('9h 30m → "09:30"', () => expect(formatTime(9 * 3_600_000 + 30 * 60_000)).toBe('09:30'));
  it('23h 59m → "23:59"', () => expect(formatTime(23 * 3_600_000 + 59 * 60_000)).toBe('23:59'));
  it('12h → "12:00"', () => expect(formatTime(12 * 3_600_000)).toBe('12:00'));
});

describe('formatDetailDate', () => {
  // Uses UTC methods, so construct with Date.UTC to avoid timezone variance
  it('formats a UTC date as "Weekday, Mon D, YYYY"', () => {
    const date = new Date(Date.UTC(2024, 2, 15)); // UTC: Fri Mar 15 2024
    expect(formatDetailDate(date)).toBe('Fri, Mar 15, 2024');
  });

  it('formats a date at year boundary', () => {
    const date = new Date(Date.UTC(2024, 0, 1)); // UTC: Mon Jan 1 2024
    expect(formatDetailDate(date)).toBe('Mon, Jan 1, 2024');
  });
});
