import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ALL_DAY_GAP,
  ALL_DAY_PAD,
  ALL_DAY_ROW_H,
  START_HOUR,
  HOUR_HEIGHT,
  HOURS,
  WEEK_START,
} from 'app/pages/WeekView/const';
import { dayToDateStr, formatHour, getWeekDays, isMultiDay, msToUtcHM } from 'app/pages/WeekView/utils';
import { useAppSelector } from 'app/store';
import { useLabels } from 'app/hooks/useLabels';
import { layoutWeek } from 'app/pages/MonthView/utils';
import { WeekDayHeaders } from './WeekDayHeaders';
import { AllDayRow } from './AllDayRow';
import { TimeGrid } from './TimeGrid';
import type { DragInfo, IWeekGridHandle, IWeekGridProps } from '../../types';
import { getEventStartMs } from 'app/utils/event';

export const WeekGrid = forwardRef<IWeekGridHandle, IWeekGridProps>(function WeekGrid(
  { onWeekChange, onEventClick },
  ref,
) {
  const [refDate, setRefDate] = useState(new Date());
  const events = useAppSelector((state) => state.events.items);
  const { labels } = useLabels();
  const [sharedDragInfo, setSharedDragInfo] = useState<DragInfo | null>(null);
  const gridRootRef = useRef<HTMLDivElement>(null);
  const hourLabelsRef = useRef<HTMLDivElement>(null);
  const timeGridScrollRef = useRef<HTMLDivElement>(null);
  const handleDragEnd = () => setSharedDragInfo(null);
  const handleTimeScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (hourLabelsRef.current) hourLabelsRef.current.scrollTop = event.currentTarget.scrollTop;
  };

  useLayoutEffect(() => {
    const scrollProbe = document.createElement('div');
    scrollProbe.style.height = '100px';
    scrollProbe.style.overflow = 'scroll';
    scrollProbe.style.position = 'absolute';
    scrollProbe.style.top = '-9999px';
    scrollProbe.style.width = '100px';
    document.body.append(scrollProbe);
    const scrollbarWidth = scrollProbe.offsetWidth - scrollProbe.clientWidth;
    scrollProbe.remove();
    gridRootRef.current?.style.setProperty('--week-scrollbar-gutter', `${scrollbarWidth}px`);
  }, []);

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
    () => Object.fromEntries(labels.map((l) => [l._id, l.color])),
    [labels],
  );

  const { allDayEvents, timedEventsByDate } = useMemo(() => {
    const allDay = [] as typeof events;
    const timed: Record<string, typeof events> = {};
    for (const ev of events) {
      if (isMultiDay(ev)) {
        allDay.push(ev);
      } else {
        const ds = dayToDateStr(new Date(getEventStartMs(ev)));
        (timed[ds] ??= []).push(ev);
      }
    }
    return { allDayEvents: allDay, timedEventsByDate: timed };
  }, [events]);

  const firstTimedEventOffset = useMemo(() => {
    const weekDateSet = new Set(weekDays.map(dayToDateStr));
    let firstStartMs = Infinity;

    for (const dateStr of weekDateSet) {
      const dayEvents = timedEventsByDate[dateStr] ?? [];
      for (const event of dayEvents) {
        firstStartMs = Math.min(firstStartMs, getEventStartMs(event));
      }
    }

    if (!Number.isFinite(firstStartMs)) return null;

    const [hour, minute] = msToUtcHM(firstStartMs);
    return Math.max(0, (hour * 60 + minute - START_HOUR * 60) * (HOUR_HEIGHT / 60));
  }, [weekDays, timedEventsByDate]);

  useLayoutEffect(() => {
    if (firstTimedEventOffset === null) return;
    const scrollEl = timeGridScrollRef.current;
    if (!scrollEl) return;

    scrollEl.scrollTop = firstTimedEventOffset;
    if (hourLabelsRef.current) hourLabelsRef.current.scrollTop = firstTimedEventOffset;
  }, [firstTimedEventOffset]);

  const allDayLayout = useMemo(() => layoutWeek(weekDays, allDayEvents), [weekDays, allDayEvents]);
  const usedLanes = allDayLayout.visibleBars.reduce((max, b) => Math.max(max, b.lane + 1), 0);
  const hasOverflow = allDayLayout.overflowByCol.some((n) => n > 0);
  const laneRows = Math.max(1, usedLanes) + (hasOverflow ? 1 : 0);
  const allDayHeight =
    ALL_DAY_PAD * 2 + laneRows * ALL_DAY_ROW_H + Math.max(0, laneRows - 1) * ALL_DAY_GAP;

  return (
    <div
      ref={gridRootRef}
      className='flex h-full min-h-0 rounded-lg border border-outline-variant overflow-hidden bg-surface-container-lowest'
      style={{ '--week-scrollbar-gutter': '0px' } as React.CSSProperties}>
      <div className='w-20 shrink-0 border-r border-outline-variant flex flex-col min-h-0'>
        <div className='h-14 border-b border-outline-variant shrink-0' />
        <div
          className='border-b border-outline-variant flex items-center justify-end pr-2 pt-1 shrink-0'
          style={{ height: allDayHeight }}>
          <span className='text-label-xs text-on-surface-variant whitespace-nowrap'>all-day</span>
        </div>
        <div ref={hourLabelsRef} className='min-h-0 flex-1 overflow-hidden'>
          {HOURS.map((h) => (
            <div
              key={h}
              className='flex items-start justify-end pr-2 pt-1 shrink-0'
              style={{ height: HOUR_HEIGHT }}>
              <span className='text-label-sm text-on-surface-variant'>{formatHour(h)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className='min-w-0 flex-1 overflow-x-auto flex flex-col min-h-0'>
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
        <div
          ref={timeGridScrollRef}
          className='min-h-0 flex-1 overflow-y-auto overscroll-contain'
          onScroll={handleTimeScroll}>
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
    </div>
  );
});
