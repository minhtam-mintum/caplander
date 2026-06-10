import { timeToOffset, durationToHeight, getCurrentTimeOffset } from 'app/utils';

describe('timeToOffset', () => {
  it('calculates pixel offset from hour zero', () => {
    expect(timeToOffset('09:00', 0, 60)).toBe(540);
  });

  it('calculates offset relative to a non-zero start hour', () => {
    expect(timeToOffset('09:30', 9, 60)).toBe(30);
  });

  it('returns zero when time equals startHour', () => {
    expect(timeToOffset('08:00', 8, 64)).toBe(0);
  });

  it('scales with hourHeight', () => {
    expect(timeToOffset('01:00', 0, 100)).toBe(100);
    expect(timeToOffset('01:00', 0, 64)).toBe(64);
  });

  it('handles minutes correctly', () => {
    expect(timeToOffset('00:30', 0, 60)).toBe(30);
  });
});

describe('durationToHeight', () => {
  it('one hour span', () => expect(durationToHeight('09:00', '10:00', 60)).toBe(60));
  it('30-minute span', () => expect(durationToHeight('09:00', '09:30', 60)).toBe(30));
  it('two-hour span', () => expect(durationToHeight('00:00', '02:00', 100)).toBe(200));
  it('45-minute span', () => expect(durationToHeight('10:00', '10:45', 60)).toBe(45));
});

describe('getCurrentTimeOffset', () => {
  it('returns a non-negative value', () => {
    expect(getCurrentTimeOffset(0, 60)).toBeGreaterThanOrEqual(0);
  });

  it('is consistent with timeToOffset for the current time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 2, 15, 9, 30, 0));
    expect(getCurrentTimeOffset(0, 60)).toBe(570); // 9*60 + 30 = 570 min → 570px at 60px/hr
    vi.useRealTimers();
  });
});
