import { useState, useMemo, useRef, useCallback } from 'react';
import { cn } from 'app/utils/cn';
import {
  clampHour,
  dayToDateStr,
  layoutTimedEvents,
  msToUtcHM,
  toTimeString,
} from 'app/pages/WeekView/utils';
import {
  DEFAULT_COLOR,
  END_HOUR,
  HOUR_HEIGHT,
  HOURS,
  SNAP_MIN,
  START_HOUR,
  TOTAL_HEIGHT,
} from 'app/pages/WeekView/const';
import { durationToHeight, getCurrentTimeOffset, timeToOffset } from 'app/utils';
import { WeekEventCard } from 'app/components/molecules/WeekEventCard';
import { useAppDispatch, useAppSelector } from 'app/store';
import { updateEventThunk } from 'app/store/slices/eventSlice';
import type { IEvent } from 'app/store/slices/eventSlice';
import type { DragInfo } from 'app/pages/WeekView/types';
import {
  getEventEndMs,
  getEventId,
  getEventLabelId,
  getEventStartMs,
  withEventTime,
} from 'app/utils/event';

const DEFAULT_TIMED_DURATION = 3_600_000; // 1 hour in ms — default when converting from all-day

interface ITimeGridProps {
  weekDays: Date[];
  timedEventsByDate: Record<string, IEvent[]>;
  labelColorMap: Record<string, string>;
  onEventClick?: (event: IEvent) => void;
  dragInfo: DragInfo | null;
  onDragStart: (info: DragInfo) => void;
  onDragEnd: () => void;
}

type ResizeInfo = { id: string; startMs: number; dateStr: string };
type ResizeTarget = { id: string; dateStr: string; newEndMs: number };

export const TimeGrid = ({
  weekDays,
  timedEventsByDate,
  labelColorMap,
  onEventClick,
  dragInfo,
  onDragStart,
  onDragEnd,
}: ITimeGridProps) => {
  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.events.items);
  const [dragTarget, setDragTarget] = useState<{ dateStr: string; newStartMs: number } | null>(
    null,
  );
  const resizeInfoRef = useRef<ResizeInfo | null>(null);
  const [resizeTarget, setResizeTarget] = useState<ResizeTarget | null>(null);
  const gridRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const todayStr = dayToDateStr(new Date());
  const currentOffset = getCurrentTimeOffset(START_HOUR, HOUR_HEIGHT);

  const timedEventLayouts = useMemo(() => {
    const out: Record<string, Map<string, { col: number; totalCols: number }>> = {};
    for (const [ds, evs] of Object.entries(timedEventsByDate)) {
      out[ds] = layoutTimedEvents(evs);
    }
    return out;
  }, [timedEventsByDate]);

  const resetDrag = () => {
    onDragEnd();
    setDragTarget(null);
  };

  const handleResizeStart = useCallback(
    (e: React.PointerEvent, event: IEvent, dateStr: string) => {
      const gridDiv = gridRefs.current.get(dateStr);
      if (!gridDiv) return;
      gridDiv.setPointerCapture(e.pointerId);
      resizeInfoRef.current = { id: getEventId(event), startMs: getEventStartMs(event), dateStr };
      setResizeTarget({ id: getEventId(event), dateStr, newEndMs: getEventEndMs(event) });
    },
    [],
  );

  const handleResizeMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, dateStr: string) => {
      const ri = resizeInfoRef.current;
      if (!ri || ri.dateStr !== dateStr) return;
      const gridDiv = gridRefs.current.get(dateStr);
      if (!gridDiv) return;
      const rect = gridDiv.getBoundingClientRect();
      const yInGrid = Math.max(0, Math.min(e.clientY - rect.top, TOTAL_HEIGHT));
      const totalMin = (yInGrid / HOUR_HEIGHT) * 60;
      const snappedMin = Math.round(totalMin / SNAP_MIN) * SNAP_MIN;
      const [y, m, d] = dateStr.split('-').map(Number);
      const rawEndMs = Date.UTC(y, m - 1, d) + (START_HOUR * 60 + snappedMin) * 60000;
      const minEndMs = ri.startMs + SNAP_MIN * 60000;
      const maxEndMs = Date.UTC(y, m - 1, d) + END_HOUR * 3600000;
      const newEndMs = Math.max(minEndMs, Math.min(rawEndMs, maxEndMs));
      setResizeTarget((prev) =>
        prev && prev.dateStr === dateStr && prev.newEndMs === newEndMs
          ? prev
          : { id: ri.id, dateStr, newEndMs },
      );
    },
    [],
  );

  const handleResizeEnd = useCallback(
    (_e: React.PointerEvent<HTMLDivElement>, dateStr: string) => {
      const ri = resizeInfoRef.current;
      if (!ri || ri.dateStr !== dateStr) return;
      setResizeTarget((rt) => {
        if (rt) {
          const event = events.find((ev) => getEventId(ev) === ri.id);
          if (event) dispatch(updateEventThunk(withEventTime(event, getEventStartMs(event), rt.newEndMs)));
        }
        return null;
      });
      resizeInfoRef.current = null;
    },
    [events, dispatch],
  );

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, event: IEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const grabOffsetMin =
      Math.round((((e.clientY - rect.top) / HOUR_HEIGHT) * 60) / SNAP_MIN) * SNAP_MIN;
    onDragStart({
      type: 'timed',
      id: getEventId(event),
      grabOffsetMin: Math.max(0, grabOffsetMin),
      durationMs: getEventEndMs(event) - getEventStartMs(event),
    });
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', getEventId(event));
    } catch {
      /* */
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, dateStr: string) => {
    if (!dragInfo) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const gridDiv = gridRefs.current.get(dateStr);
    if (!gridDiv) return;
    const rect = gridDiv.getBoundingClientRect();
    const yInGrid = Math.max(0, Math.min(e.clientY - rect.top, TOTAL_HEIGHT));
    const totalMin = (yInGrid / HOUR_HEIGHT) * 60;
    const grabOffsetMin = dragInfo.type === 'timed' ? dragInfo.grabOffsetMin : 0;
    const durationMs = dragInfo.type === 'timed' ? dragInfo.durationMs : DEFAULT_TIMED_DURATION;
    const newStartMin = totalMin - grabOffsetMin;
    const snappedMin = Math.round(newStartMin / SNAP_MIN) * SNAP_MIN;
    const durationMin = durationMs / 60000;
    const clampedMin = Math.max(
      0,
      Math.min(snappedMin, (END_HOUR - START_HOUR) * 60 - durationMin),
    );
    const [y, m, d] = dateStr.split('-').map(Number);
    const newStartMs = Date.UTC(y, m - 1, d) + (START_HOUR * 60 + clampedMin) * 60000;
    if (dragTarget?.dateStr !== dateStr || dragTarget.newStartMs !== newStartMs)
      setDragTarget({ dateStr, newStartMs });
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, dateStr: string) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node) && dragTarget?.dateStr === dateStr)
      setDragTarget(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dragInfo || !dragTarget) return;
    const event = events.find((ev) => getEventId(ev) === dragInfo.id);
    if (event) {
      const durationMs = dragInfo.type === 'timed' ? dragInfo.durationMs : DEFAULT_TIMED_DURATION;
      dispatch(
        updateEventThunk(
          withEventTime(event, dragTarget.newStartMs, dragTarget.newStartMs + durationMs),
        ),
      );
    }
    onDragEnd();
    setDragTarget(null);
  };

  return (
    <div className='flex'>
      {weekDays.map((day) => {
        const dateStr = dayToDateStr(day);
        const isToday = dateStr === todayStr;
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        const dayEvents = timedEventsByDate[dateStr] ?? [];

        let resizePreviewCard: React.ReactNode = null;
        if (resizeTarget?.dateStr === dateStr && resizeInfoRef.current) {
          const src = events.find((ev) => getEventId(ev) === resizeTarget.id);
          if (src) {
            const [psh, psm] = clampHour(...msToUtcHM(getEventStartMs(src)), START_HOUR, END_HOUR);
            const [peh, pem] = clampHour(...msToUtcHM(resizeTarget.newEndMs), START_HOUR, END_HOUR);
            const pStart = toTimeString(psh, psm);
            const pEnd = toTimeString(peh, pem);
            if (pStart !== pEnd) {
              resizePreviewCard = (
                <WeekEventCard
                  title={src.title}
                  startTime={pStart}
                  endTime={pEnd}
                  color={labelColorMap[getEventLabelId(src)] ?? DEFAULT_COLOR}
                  offsetTop={timeToOffset(pStart, START_HOUR, HOUR_HEIGHT)}
                  height={durationToHeight(pStart, pEnd, HOUR_HEIGHT)}
                  className='pointer-events-none z-20 ring-2 ring-inset ring-current'
                  style={{ opacity: 0.75 }}
                />
              );
            }
          }
        }

        let previewCard: React.ReactNode = null;
        if (dragTarget?.dateStr === dateStr && dragInfo) {
          const src = events.find((ev) => getEventId(ev) === dragInfo.id);
          if (src) {
            const durationMs =
              dragInfo.type === 'timed' ? dragInfo.durationMs : DEFAULT_TIMED_DURATION;
            const [psh, psm] = clampHour(
              ...msToUtcHM(dragTarget.newStartMs),
              START_HOUR,
              END_HOUR,
            );
            const [peh, pem] = clampHour(
              ...msToUtcHM(dragTarget.newStartMs + durationMs),
              START_HOUR,
              END_HOUR,
            );
            const pStart = toTimeString(psh, psm);
            const pEnd = toTimeString(peh, pem);
            if (pStart !== pEnd) {
              previewCard = (
                <WeekEventCard
                  title={src.title}
                  startTime={pStart}
                  endTime={pEnd}
                  color={labelColorMap[getEventLabelId(src)] ?? DEFAULT_COLOR}
                  offsetTop={timeToOffset(pStart, START_HOUR, HOUR_HEIGHT)}
                  height={durationToHeight(pStart, pEnd, HOUR_HEIGHT)}
                  className='pointer-events-none z-20 ring-2 ring-inset ring-current'
                  style={{ opacity: 0.75 }}
                />
              );
            }
          }
        }

        return (
          <div
            key={dateStr}
            className={cn(
              'flex-1 min-w-24 border-l first:border-l-0 border-outline-variant',
              isWeekend && 'bg-surface-container-low/40',
            )}>
            <div
              ref={(el) => {
                if (el) gridRefs.current.set(dateStr, el);
                else gridRefs.current.delete(dateStr);
              }}
              className='relative'
              style={{ height: TOTAL_HEIGHT }}
              onDragOver={(e) => handleDragOver(e, dateStr)}
              onDragLeave={(e) => handleDragLeave(e, dateStr)}
              onDrop={handleDrop}
              onPointerMove={(e) => handleResizeMove(e, dateStr)}
              onPointerUp={(e) => handleResizeEnd(e, dateStr)}
              onPointerCancel={(e) => handleResizeEnd(e, dateStr)}>
              {HOURS.map((h) => (
                <div
                  key={h}
                  className='absolute w-full border-b border-outline-variant/30'
                  style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
                />
              ))}
              {dayEvents.map((event) => {
                const eventId = getEventId(event);
                const [sh, sm] = clampHour(...msToUtcHM(getEventStartMs(event)), START_HOUR, END_HOUR);
                const [eh, em] = clampHour(...msToUtcHM(getEventEndMs(event)), START_HOUR, END_HOUR);
                const startTime = toTimeString(sh, sm);
                const endTime = toTimeString(eh, em);
                if (startTime === endTime) return null;
                const color = labelColorMap[getEventLabelId(event)] ?? DEFAULT_COLOR;
                const isDragging = dragInfo?.id === eventId;
                const isResizing = resizeTarget?.id === eventId;
                const layout = timedEventLayouts[dateStr]?.get(eventId);
                const overlapStyle: React.CSSProperties =
                  layout && layout.totalCols > 1
                    ? {
                        left: `calc(${(layout.col / layout.totalCols) * 100}% + 4px)`,
                        right: `calc(${((layout.totalCols - layout.col - 1) / layout.totalCols) * 100}% + 4px)`,
                        zIndex: layout.col + 1,
                      }
                    : {};
                return (
                  <WeekEventCard
                    key={eventId}
                    title={event.title}
                    startTime={startTime}
                    endTime={endTime}
                    color={color}
                    offsetTop={timeToOffset(startTime, START_HOUR, HOUR_HEIGHT)}
                    height={durationToHeight(startTime, endTime, HOUR_HEIGHT)}
                    draggable={!isResizing}
                    className={cn(
                      isDragging || isResizing ? 'opacity-40' : '',
                      isDragging ? 'cursor-grabbing' : 'cursor-grab',
                    )}
                    style={overlapStyle}
                    onDragStart={(e) => handleDragStart(e, event)}
                    onDragEnd={resetDrag}
                    onResizeStart={(e) => handleResizeStart(e, event, dateStr)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!dragInfo && !resizeTarget) onEventClick?.(event);
                    }}
                  />
                );
              })}
              {previewCard}
              {resizePreviewCard}
              {isToday && currentOffset >= 0 && currentOffset <= TOTAL_HEIGHT && (
                <div
                  className='absolute inset-x-0 flex items-center pointer-events-none z-10'
                  style={{ top: currentOffset }}>
                  <div className='w-2 h-2 rounded-full bg-primary shrink-0 -ml-1' />
                  <div className='flex-1 border-t-2 border-primary' />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
