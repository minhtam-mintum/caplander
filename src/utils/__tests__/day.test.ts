import { formatHour24, formatFullDate, getDayTitle, formatTimeRange } from 'app/utils/day';

describe('formatHour24', () => {
  it('pads single-digit hour', () => expect(formatHour24(9)).toBe('09:00'));
  it('midnight', () => expect(formatHour24(0)).toBe('00:00'));
  it('noon', () => expect(formatHour24(12)).toBe('12:00'));
  it('23h', () => expect(formatHour24(23)).toBe('23:00'));
});

describe('formatFullDate', () => {
  it('includes weekday, month, day, and year', () => {
    const date = new Date(2024, 2, 15); // March 15, 2024 (Friday)
    const result = formatFullDate(date);
    expect(result).toContain('Friday');
    expect(result).toContain('March');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });
});

describe('getDayTitle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 2, 15, 12, 0, 0)); // March 15, 2024
  });

  afterEach(() => vi.useRealTimers());

  it('returns "Today" for today', () => {
    expect(getDayTitle(new Date(2024, 2, 15))).toBe('Today');
  });

  it('returns "Tomorrow" for the next day', () => {
    expect(getDayTitle(new Date(2024, 2, 16))).toBe('Tomorrow');
  });

  it('returns "Yesterday" for the previous day', () => {
    expect(getDayTitle(new Date(2024, 2, 14))).toBe('Yesterday');
  });

  it('returns weekday name for a date within the week', () => {
    expect(getDayTitle(new Date(2024, 2, 18))).toBe('Monday');
  });
});

describe('formatTimeRange', () => {
  it('formats exact hours without minutes', () => {
    expect(formatTimeRange('09:00', '10:00')).toBe('9 AM - 10 AM');
  });

  it('formats with minutes', () => {
    expect(formatTimeRange('09:30', '10:45')).toBe('9:30 AM - 10:45 AM');
  });

  it('handles crossing noon', () => {
    expect(formatTimeRange('11:00', '13:00')).toBe('11 AM - 1 PM');
  });

  it('handles midnight (hour 0 → 12 AM)', () => {
    expect(formatTimeRange('00:00', '01:00')).toBe('12 AM - 1 AM');
  });

  it('handles noon exactly (hour 12 → 12 PM)', () => {
    expect(formatTimeRange('12:00', '13:00')).toBe('12 PM - 1 PM');
  });
});
