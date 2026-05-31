import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useState } from 'react';
import {
  ALL_DAY_GAP,
  ALL_DAY_PAD,
  ALL_DAY_ROW_H,
  HOUR_HEIGHT,
  HOURS,
  WEEK_START,
} from 'app/pages/WeekView/const';
import { dayToDateStr, formatHour, getWeekDays, isMultiDay } from 'app/pages/WeekView/utils';
import { useAppSelector } from 'app/store';
import { useLabels } from 'app/hooks/useLabels';
import { layoutWeek } from 'app/pages/MonthView/utils';
import { WeekDayHeaders } from './WeekDayHeaders';
import { AllDayRow } from './AllDayRow';
import { TimeGrid } from './TimeGrid';
import type { DragInfo, IWeekGridHandle, IWeekGridProps } from '../../types';

export const WeekGrid = forwardRef<IWeekGridHandle, IWeekGridProps>(function WeekGrid(
  { onWeekChange, onEventClick },
  ref,
) {
  const [refDate, setRefDate] = useState(new Date());
  const events = useAppSelector((state) => state.events.items);
  const { labels } = useLabels();
  const [sharedDragInfo, setSharedDragInfo] = useState<DragInfo | null>(null);
  const handleDragEnd = () => setSharedDragInfo(null);

  useImperativeHandle(
    ref,
    () => ({
      prev: () =>
        setRefDate((d) => {
          const n = new Date(d);
          n.setDate(d.getDate() - 7);
          return n;
        }),
      next: () =>
        setRefDate((d) => {
          const n = new Date(d);
          n.setDate(d.getDate() + 7);
          return n;
        }),
      goToday: () => setRefDate(new Date()),
      goToDate: (date: Date) => setRefDate(date),
    }),
    [],
  );

  const weekDays = useMemo(() => getWeekDays(refDate, WEEK_START), [refDate]);

  useLayoutEffect(() => {
    onWeekChange?.(weekDays);
  }, [weekDays, onWeekChange]);

  const labelColorMap = useMemo(
    () => Object.fromEntries(labels.map((l) => [l.value, l.color])),
    [labels],
  );

  const { allDayEvents, timedEventsByDate } = useMemo(() => {
    const allDay = [] as typeof events;
    const timed: Record<string, typeof events> = {};
    for (const ev of events) {
      if (isMultiDay(ev)) {
        allDay.push(ev);
      } else {
        const ds = dayToDateStr(new Date(ev.start));
        (timed[ds] ??= []).push(ev);
      }
    }
    return { allDayEvents: allDay, timedEventsByDate: timed };
  }, [events]);

  const allDayLayout = useMemo(() => layoutWeek(weekDays, allDayEvents), [weekDays, allDayEvents]);
  const usedLanes = allDayLayout.visibleBars.reduce((max, b) => Math.max(max, b.lane + 1), 0);
  const hasOverflow = allDayLayout.overflowByCol.some((n) => n > 0);
  const laneRows = Math.max(1, usedLanes) + (hasOverflow ? 1 : 0);
  const allDayHeight =
    ALL_DAY_PAD * 2 + laneRows * ALL_DAY_ROW_H + Math.max(0, laneRows - 1) * ALL_DAY_GAP;

  return (
    <div className='flex rounded-lg border border-outline-variant overflow-hidden bg-surface-container-lowest'>
      <div className='w-20 shrink-0 border-r border-outline-variant flex flex-col'>
        <div className='h-14 border-b border-outline-variant shrink-0' />
        <div
          className='border-b border-outline-variant flex items-center justify-end pr-2 pt-1 shrink-0'
          style={{ height: allDayHeight }}>
          <span className='text-label-xs text-on-surface-variant whitespace-nowrap'>all-day</span>
        </div>
        {HOURS.map((h) => (
          <div
            key={h}
            className='flex items-start justify-end pr-2 pt-1 shrink-0'
            style={{ height: HOUR_HEIGHT }}>
            <span className='text-label-sm text-on-surface-variant'>{formatHour(h)}</span>
          </div>
        ))}
      </div>

      <div className='flex-1 overflow-x-auto flex flex-col'>
        <WeekDayHeaders weekDays={weekDays} />
        <AllDayRow
          weekDays={weekDays}
          allDayLayout={allDayLayout}
          allDayHeight={allDayHeight}
          labelColorMap={labelColorMap}
          onEventClick={onEventClick}
          dragInfo={sharedDragInfo}
          onDragStart={setSharedDragInfo}
          onDragEnd={handleDragEnd}
        />
        <TimeGrid
          weekDays={weekDays}
          timedEventsByDate={timedEventsByDate}
          labelColorMap={labelColorMap}
          onEventClick={onEventClick}
          dragInfo={sharedDragInfo}
          onDragStart={setSharedDragInfo}
          onDragEnd={handleDragEnd}
        />
      </div>
    </div>
  );
});
