import { stripHtml, formatRelativeTime, toFormData } from '../utils';
import type { IEvent } from 'app/store/slices/eventSlice';

// Pin "now" to a fixed UTC timestamp: 2024-03-15 09:00:00 UTC
const NOW = Date.UTC(2024, 2, 15, 9, 0, 0);

describe('stripHtml', () => {
  it('strips simple tags', () => {
    expect(stripHtml('<p>Hello</p>')).toBe('Hello');
  });

  it('strips nested tags', () => {
    expect(stripHtml('<b><i>Bold italic</i></b>')).toBe('Bold italic');
  });

  it('returns plain text unchanged', () => {
    expect(stripHtml('no tags here')).toBe('no tags here');
  });

  it('returns empty string for empty input', () => {
    expect(stripHtml('')).toBe('');
  });

  it('strips tags and preserves text content', () => {
    expect(stripHtml('<span>Hello</span> <span>World</span>')).toBe('Hello World');
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => vi.useRealTimers());

  it('returns "Starting now" within 60 seconds', () => {
    expect(formatRelativeTime(NOW + 30_000)).toBe('Starting now');
    expect(formatRelativeTime(NOW - 30_000)).toBe('Starting now');
  });

  it('returns "Starting in Xm" for events within the next hour', () => {
    expect(formatRelativeTime(NOW + 10 * 60_000)).toBe('Starting in 10m');
    expect(formatRelativeTime(NOW + 45 * 60_000)).toBe('Starting in 45m');
  });

  it('returns "Today at HH:MM AM/PM" for same-day events beyond 1 hour', () => {
    // NOW = 09:00 UTC, event at 14:00 UTC same day
    const sameDay = Date.UTC(2024, 2, 15, 14, 0, 0);
    expect(formatRelativeTime(sameDay)).toMatch(/^Today at/);
    expect(formatRelativeTime(sameDay)).toContain('2:00 PM');
  });

  it('returns "Tomorrow at ..." for next-day events', () => {
    const tomorrow = Date.UTC(2024, 2, 16, 10, 0, 0);
    expect(formatRelativeTime(tomorrow)).toMatch(/^Tomorrow at/);
  });

  it('returns weekday name for events 2–7 days out', () => {
    // Mar 18 (Monday) is 3 days ahead
    const monday = Date.UTC(2024, 2, 18, 10, 0, 0);
    expect(formatRelativeTime(monday)).toMatch(/^Monday at/);
  });

  it('returns "Next week at ..." for events 8–14 days out', () => {
    const nextWeek = Date.UTC(2024, 2, 23, 10, 0, 0); // 8 days out
    expect(formatRelativeTime(nextWeek)).toMatch(/^Next week at/);
  });

  it('returns "Mon D at ..." for events further out', () => {
    const far = Date.UTC(2024, 3, 15, 10, 0, 0); // Apr 15, 31 days out
    expect(formatRelativeTime(far)).toMatch(/^Apr 15 at/);
  });
});

describe('toFormData', () => {
  const event: IEvent = {
    _id: 'evt-1',
    title: 'Team Sync',
    startDate: new Date(Date.UTC(2024, 2, 15) + 9 * 3_600_000).toISOString(),  // Mar 15 at 09:00 UTC
    endDate: new Date(Date.UTC(2024, 2, 15) + 10 * 3_600_000).toISOString(),   // Mar 15 at 10:00 UTC
    allDay: false,
    alert: 0,
    labelId: 'work',
    description: '<p>notes</p>',
  };

  it('maps id and name', () => {
    const result = toFormData(event);
    expect(result.id).toBe('evt-1');
    expect(result.name).toBe('Team Sync');
  });

  it('strips time from start/end into UTC-midnight Date objects', () => {
    const result = toFormData(event);
    expect(result.startDate).toEqual(new Date(Date.UTC(2024, 2, 15)));
    expect(result.endDate).toEqual(new Date(Date.UTC(2024, 2, 15)));
  });

  it('extracts time-of-day milliseconds', () => {
    const result = toFormData(event);
    expect(result.startTime).toBe(9 * 3_600_000);
    expect(result.endTime).toBe(10 * 3_600_000);
  });

  it('maps label and notes', () => {
    const result = toFormData(event);
    expect(result.label).toBe('work');
    expect(result.notes).toBe('<p>notes</p>');
  });

  it('maps alert', () => {
    const result = toFormData({ ...event, alert: 300_000 });
    expect(result.alert).toBe(300_000);
  });
});
