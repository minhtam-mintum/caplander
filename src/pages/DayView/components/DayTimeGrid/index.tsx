import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type UIEvent,
} from 'react';
import { useAppSelector } from 'app/store';
import { DAY_END_HOUR, DAY_HOUR_HEIGHT, DAY_START_HOUR } from 'app/utils/day';
import { dayToDateStr, formatHour, isMultiDay, msToUtcHM } from 'app/pages/WeekView/utils';
import { ALL_DAY_GAP, ALL_DAY_PAD, ALL_DAY_ROW_H } from 'app/pages/WeekView/const';
import { DayAllDayRow } from './DayAllDayRow';
import { DayColumn } from './DayColumn';
import type { DayDragState, IDayTimeGridHandle, IDayTimeGridProps } from './types';
import { getEventEndMs, getEventStartMs } from 'app/utils/event';

export type { IDayTimeGridHandle };

const HOURS = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i);

export const DayTimeGrid = forwardRef<IDayTimeGridHandle, IDayTimeGridProps>(function DayTimeGrid(
  { onDateChange, onEventClick },
  ref,
) {
  const [date, setDate] = useState(new Date());
  const events = useAppSelector((state) => state.events.items);
  const labels = useAppSelector((s) => s.labels.items);
  const [dragState, setDragState] = useState<DayDragState | null>(null);
  const gridRootRef = useRef<HTMLDivElement>(null);
  const hourLabelsRef = useRef<HTMLDivElement>(null);
  const timeGridScrollRef = useRef<HTMLDivElement>(null);
  const autoScrolledDayKeyRef = useRef<string | null>(null);

  const handleDragEnd = useCallback(() => setDragState(null), []);
  const handleTimeScroll = (event: UIEvent<HTMLDivElement>) => {
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
    gridRootRef.current?.style.setProperty('--day-scrollbar-gutter', `${scrollbarWidth}px`);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      prev: () =>
        setDate((d) => {
          const n = new Date(d);
          n.setDate(d.getDate() - 1);
          return n;
        }),
      next: () =>
        setDate((d) => {
          const n = new Date(d);
          n.setDate(d.getDate() + 1);
          return n;
        }),
      goToday: () => setDate(new Date()),
      goToDate: (date: Date) => setDate(date),
    }),
    [],
  );

  useLayoutEffect(() => {
    onDateChange?.(date);
  }, [date, onDateChange]);

  const dateStr = dayToDateStr(date);
  const isToday = dateStr === dayToDateStr(new Date());

  const labelColorMap = useMemo(
    () => Object.fromEntries(labels.map((l) => [l._id, l.color])),
    [labels],
  );

  const { allDayEvents, timedEvents } = useMemo(() => {
    const allDay = [] as typeof events;
    const timed = [] as typeof events;
    for (const ev of events) {
      const start = getEventStartMs(ev);
      const end = getEventEndMs(ev);
      if (isMultiDay(ev)) {
        const evStartDs = dayToDateStr(new Date(start));
        const evEndDs = dayToDateStr(new Date(end - 1));
        if (evStartDs <= dateStr && dateStr <= evEndDs) allDay.push(ev);
      } else if (dayToDateStr(new Date(start)) === dateStr) {
        timed.push(ev);
      }
    }
    return { allDayEvents: allDay, timedEvents: timed };
  }, [events, dateStr]);

  const firstTimedEventOffset = useMemo(() => {
    let firstStartMs = Infinity;

    for (const event of timedEvents) {
      firstStartMs = Math.min(firstStartMs, getEventStartMs(event));
    }

    if (!Number.isFinite(firstStartMs)) return null;

    const [hour, minute] = msToUtcHM(firstStartMs);
    return Math.max(0, (hour * 60 + minute - DAY_START_HOUR * 60) * (DAY_HOUR_HEIGHT / 60));
  }, [timedEvents]);

  useLayoutEffect(() => {
    if (firstTimedEventOffset === null) return;
    if (autoScrolledDayKeyRef.current === dateStr) return;

    const scrollEl = timeGridScrollRef.current;
    if (!scrollEl) return;

    scrollEl.scrollTop = firstTimedEventOffset;
    if (hourLabelsRef.current) hourLabelsRef.current.scrollTop = firstTimedEventOffset;
    autoScrolledDayKeyRef.current = dateStr;
  }, [dateStr, firstTimedEventOffset]);

  const allDayRowCount = Math.max(1, allDayEvents.length);
  const allDayHeight =
    ALL_DAY_PAD * 2 +
    allDayRowCount * ALL_DAY_ROW_H +
    Math.max(0, allDayRowCount - 1) * ALL_DAY_GAP;

  return (
    <div
      ref={gridRootRef}
      className='flex h-full min-h-0 rounded-lg border border-outline-variant overflow-hidden bg-surface-container-lowest'
      style={{ '--day-scrollbar-gutter': '0px' } as CSSProperties}>
      <div className='w-20 shrink-0 border-r border-outline-variant flex flex-col min-h-0'>
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
              style={{ height: DAY_HOUR_HEIGHT }}>
              <span className='text-label-sm text-on-surface-variant'>{formatHour(h)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className='min-w-0 flex-1 flex flex-col min-h-0'>
        <DayAllDayRow
          dateStr={dateStr}
          allDayEvents={allDayEvents}
          allDayHeight={allDayHeight}
          labelColorMap={labelColorMap}
          dragState={dragState}
          onEventClick={onEventClick}
          onDragStart={setDragState}
          onDragEnd={handleDragEnd}
        />
        <div
          ref={timeGridScrollRef}
          className='min-h-0 flex-1 overflow-y-auto overscroll-contain'
          onScroll={handleTimeScroll}>
          <DayColumn
            dateStr={dateStr}
            timedEvents={timedEvents}
            labelColorMap={labelColorMap}
            isToday={isToday}
            dragState={dragState}
            onEventClick={onEventClick}
            onDragStart={setDragState}
            onDragEnd={handleDragEnd}
          />
        </div>
      </div>
    </div>
  );
});
