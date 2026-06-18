import { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useMemo, useState } from 'react';
import { useAppSelector } from 'app/store';
import { useLabels } from 'app/hooks/useLabels';
import { DAY_END_HOUR, DAY_HOUR_HEIGHT, DAY_START_HOUR } from 'app/utils/day';
import { dayToDateStr, formatHour, isMultiDay } from 'app/pages/WeekView/utils';
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
  const { labels } = useLabels();
  const [dragState, setDragState] = useState<DayDragState | null>(null);

  const handleDragEnd = useCallback(() => setDragState(null), []);

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

  const allDayRowCount = Math.max(1, allDayEvents.length);
  const allDayHeight =
    ALL_DAY_PAD * 2 +
    allDayRowCount * ALL_DAY_ROW_H +
    Math.max(0, allDayRowCount - 1) * ALL_DAY_GAP;

  return (
    <div className='flex rounded-lg border border-outline-variant overflow-hidden bg-surface-container-lowest'>
      {/* Hour labels */}
      <div className='w-20 shrink-0 border-r border-outline-variant flex flex-col'>
        <div
          className='border-b border-outline-variant flex items-center justify-end pr-2 pt-1 shrink-0'
          style={{ height: allDayHeight }}>
          <span className='text-label-xs text-on-surface-variant whitespace-nowrap'>all-day</span>
        </div>
        {HOURS.map((h) => (
          <div
            key={h}
            className='flex items-start justify-end pr-2 pt-1 shrink-0'
            style={{ height: DAY_HOUR_HEIGHT }}>
            <span className='text-label-sm text-on-surface-variant'>{formatHour(h)}</span>
          </div>
        ))}
      </div>

      {/* Main column */}
      <div className='flex-1 flex flex-col'>
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
  );
});
