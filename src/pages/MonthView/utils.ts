import type { IEvent } from 'app/store/slices/eventSlice';
import type { BarItem } from './types';

export const MAX_LANES = 3;
export const DAY_MS = 86400000;

export function layoutWeek(
  weekDates: Date[],
  events: IEvent[],
): { visibleBars: BarItem[]; overflowByCol: number[] } {
  const w0 = weekDates[0];
  const w6 = weekDates[6];
  const weekStartMs = Date.UTC(w0.getFullYear(), w0.getMonth(), w0.getDate());
  const weekEndMs = Date.UTC(w6.getFullYear(), w6.getMonth(), w6.getDate());
  const bars: BarItem[] = [];

  for (const e of events) {
    const evStartMs = Math.floor(e.start / DAY_MS) * DAY_MS;
    const evEndMs = Math.floor(e.end / DAY_MS) * DAY_MS;
    if (evEndMs < weekStartMs || evStartMs > weekEndMs) continue;

    const segStartMs = evStartMs < weekStartMs ? weekStartMs : evStartMs;
    const segEndMs = evEndMs > weekEndMs ? weekEndMs : evEndMs;
    const startCol = Math.round((segStartMs - weekStartMs) / DAY_MS) + 1;
    const endCol = Math.round((segEndMs - weekStartMs) / DAY_MS) + 1;

    bars.push({
      ev: e,
      startCol,
      endCol,
      startsBefore: evStartMs < weekStartMs,
      endsAfter: evEndMs > weekEndMs,
      lane: 0,
      span: endCol - startCol + 1,
      evStartMs,
      evSpan: Math.round((evEndMs - evStartMs) / DAY_MS) + 1,
    });
  }

  bars.sort((a, b) => b.span - a.span || a.startCol - b.startCol);

  const laneUsage: [number, number][][] = [];
  for (const bar of bars) {
    let lane = 0;
    for (;;) {
      if (!laneUsage[lane]) laneUsage[lane] = [];
      const conflict = laneUsage[lane].some(([s, e]) => !(bar.endCol < s || bar.startCol > e));
      if (!conflict) {
        laneUsage[lane].push([bar.startCol, bar.endCol]);
        bar.lane = lane;
        break;
      }
      lane++;
    }
  }

  const overflowByCol = Array<number>(8).fill(0);
  for (const b of bars.filter((b) => b.lane >= MAX_LANES)) {
    for (let c = b.startCol; c <= b.endCol; c++) overflowByCol[c]++;
  }

  return { visibleBars: bars.filter((b) => b.lane < MAX_LANES), overflowByCol };
}

export function dropShadow(isStart: boolean, isEnd: boolean, inRange: boolean): string | undefined {
  if (!inRange) return undefined;
  const p = 'var(--color-primary)';
  if (isStart && isEnd) return `inset 0 0 0 2px ${p}`;
  if (isStart) return `inset 2px 0 0 ${p}, inset 0 2px 0 ${p}, inset 0 -2px 0 ${p}`;
  if (isEnd) return `inset -2px 0 0 ${p}, inset 0 2px 0 ${p}, inset 0 -2px 0 ${p}`;
  return `inset 0 2px 0 ${p}, inset 0 -2px 0 ${p}`;
}
