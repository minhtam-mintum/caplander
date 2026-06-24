import { layoutWeek, dropShadow, DAY_MS, MAX_LANES } from 'app/pages/MonthView/utils';
import type { IEvent } from 'app/store/slices/eventSlice';

// Week: Mon Mar 11 – Sun Mar 17, 2024 (local dates)
const weekDates = Array.from({ length: 7 }, (_, i) => new Date(2024, 2, 11 + i));

// UTC midnight timestamps for each day
const D11 = Date.UTC(2024, 2, 11); // Mon
const D13 = Date.UTC(2024, 2, 13); // Wed
const D15 = Date.UTC(2024, 2, 15); // Fri
const D17 = Date.UTC(2024, 2, 17); // Sun
const D08 = Date.UTC(2024, 2, 8);  // Fri before week
const D20 = Date.UTC(2024, 2, 20); // Wed after week

function mkEvent(id: string, start: number, end: number): IEvent {
  return {
    _id: id,
    title: id,
    startDate: new Date(start).toISOString(),
    endDate: new Date(end).toISOString(),
    allDay: false,
    alert: 0,
    labelId: '',
    description: '',
  };
}

describe('layoutWeek', () => {
  it('returns empty bars and zero overflow for no events', () => {
    const { visibleBars, overflowByCol } = layoutWeek(weekDates, []);
    expect(visibleBars).toHaveLength(0);
    expect(overflowByCol.every((n) => n === 0)).toBe(true);
  });

  it('includes a multi-day event within the week with correct cols', () => {
    const ev = mkEvent('a', D11, D13); // Mon–Wed → startCol=1, endCol=3
    const { visibleBars } = layoutWeek(weekDates, [ev]);
    expect(visibleBars).toHaveLength(1);
    expect(visibleBars[0].startCol).toBe(1);
    expect(visibleBars[0].endCol).toBe(3);
    expect(visibleBars[0].startsBefore).toBe(false);
    expect(visibleBars[0].endsAfter).toBe(false);
  });

  it('skips events entirely outside the week', () => {
    const ev = mkEvent('outside', D20, D20 + DAY_MS);
    const { visibleBars } = layoutWeek(weekDates, [ev]);
    expect(visibleBars).toHaveLength(0);
  });

  it('clips and marks an event starting before the week', () => {
    const ev = mkEvent('clip-start', D08, D13);
    const { visibleBars } = layoutWeek(weekDates, [ev]);
    expect(visibleBars).toHaveLength(1);
    expect(visibleBars[0].startsBefore).toBe(true);
    expect(visibleBars[0].startCol).toBe(1);
  });

  it('clips and marks an event ending after the week', () => {
    const ev = mkEvent('clip-end', D15, D20);
    const { visibleBars } = layoutWeek(weekDates, [ev]);
    expect(visibleBars).toHaveLength(1);
    expect(visibleBars[0].endsAfter).toBe(true);
  });

  it('assigns different lanes to overlapping events', () => {
    const ev1 = mkEvent('a', D11, D13);
    const ev2 = mkEvent('b', D11, D13);
    const { visibleBars } = layoutWeek(weekDates, [ev1, ev2]);
    expect(visibleBars).toHaveLength(2);
    const lanes = visibleBars.map((b) => b.lane);
    expect(new Set(lanes).size).toBe(2);
  });

  it('non-overlapping events share lane 0', () => {
    const ev1 = mkEvent('a', D11, D11 + 1); // Mon only
    const ev2 = mkEvent('b', D15, D15 + 1); // Fri only
    const { visibleBars } = layoutWeek(weekDates, [ev1, ev2]);
    expect(visibleBars.every((b) => b.lane === 0)).toBe(true);
  });

  it(`counts overflow when more than ${MAX_LANES} events overlap in the same column`, () => {
    // 4 events all on Mon (col 1) — first 3 visible, 4th overflows
    const events = ['a', 'b', 'c', 'd'].map((id) => mkEvent(id, D11, D11 + 1));
    const { visibleBars, overflowByCol } = layoutWeek(weekDates, events);
    expect(visibleBars).toHaveLength(MAX_LANES);
    expect(overflowByCol[1]).toBe(1);
  });

  it('span equals endCol - startCol + 1', () => {
    const ev = mkEvent('a', D11, D17); // Mon–Sun → startCol=1, endCol=7
    const { visibleBars } = layoutWeek(weekDates, [ev]);
    expect(visibleBars[0].span).toBe(7);
  });
});

describe('dropShadow', () => {
  it('returns undefined when not in range', () => {
    expect(dropShadow(true, true, false)).toBeUndefined();
    expect(dropShadow(false, false, false)).toBeUndefined();
  });

  it('all-sides border when start and end', () => {
    const result = dropShadow(true, true, true);
    expect(result).toContain('inset 0 0 0 2px');
  });

  it('left+top+bottom border when start only', () => {
    const result = dropShadow(true, false, true)!;
    expect(result).toContain('inset 2px 0 0');
    expect(result).not.toContain('inset -2px');
  });

  it('right+top+bottom border when end only', () => {
    const result = dropShadow(false, true, true)!;
    expect(result).toContain('inset -2px 0 0');
    expect(result).not.toContain('inset 2px 0 0');
  });

  it('top+bottom border when middle segment', () => {
    const result = dropShadow(false, false, true)!;
    expect(result).not.toContain('inset 2px 0 0');
    expect(result).not.toContain('inset -2px 0 0');
    expect(result).toContain('inset 0 2px 0');
  });
});
