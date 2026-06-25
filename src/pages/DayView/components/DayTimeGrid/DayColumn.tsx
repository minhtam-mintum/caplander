import { useRef, useState, useCallback, useMemo } from 'react';
import { cn } from 'app/utils/cn';
import { useAppDispatch, useAppSelector } from 'app/store';
import { updateEventThunk } from 'app/store/slices/eventSlice';
import type { IEvent } from 'app/store/slices/eventSlice';
import { DAY_END_HOUR, DAY_HOUR_HEIGHT, DAY_START_HOUR } from 'app/utils/day';
import { timeToOffset, durationToHeight, getCurrentTimeOffset } from 'app/utils';
import {
  clampHour,
  layoutTimedEvents,
  msToUtcHM,
  toTimeString,
} from 'app/pages/WeekView/utils';
import { DEFAULT_COLOR, SNAP_MIN } from 'app/pages/WeekView/const';
import { DayEventCard } from 'app/components/molecules/DayEventCard';
import { WeekEventCard } from 'app/components/molecules/WeekEventCard';
import type { DayDragState } from './types';
import {
  getEventEndMs,
  getEventId,
  getResolvedEventLabelColor,
  getEventStartMs,
  withEventTime,
} from 'app/utils/event';

const HOURS = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i);
const TOTAL_HEIGHT = HOURS.length * DAY_HOUR_HEIGHT;
const DEFAULT_TIMED_DURATION = 3_600_000;

type ResizeInfo = { id: string; startMs: number };
type ResizeTarget = { id: string; newEndMs: number };

interface IDayColumnProps {
  dateStr: string;
  timedEvents: IEvent[];
  labelColorMap: Record<string, string>;
  isToday: boolean;
  dragState: DayDragState | null;
  onEventClick?: (event: IEvent) => void;
  onDragStart: (state: DayDragState) => void;
  onDragEnd: () => void;
}

export const DayColumn = ({
  dateStr,
  timedEvents,
  labelColorMap,
  isToday,
  dragState,
  onEventClick,
  onDragStart,
  onDragEnd,
}: IDayColumnProps) => {
  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.events.items);
  const gridRef = useRef<HTMLDivElement>(null);
  const [dragTarget, setDragTarget] = useState<number | null>(null);
  const resizeInfoRef = useRef<ResizeInfo | null>(null);
  const [resizeTarget, setResizeTarget] = useState<ResizeTarget | null>(null);

  const currentOffset = getCurrentTimeOffset(DAY_START_HOUR, DAY_HOUR_HEIGHT);
  const eventLayouts = useMemo(() => layoutTimedEvents(timedEvents), [timedEvents]);

  const resetDrag = useCallback(() => {
    onDragEnd();
    setDragTarget(null);
  }, [onDragEnd]);

  // ── Resize handlers ──────────────────────────────────────────────────────────

  const handleResizeStart = useCallback((e: React.PointerEvent, event: IEvent) => {
    const gridDiv = gridRef.current;
    if (!gridDiv) return;
    gridDiv.setPointerCapture(e.pointerId);
    resizeInfoRef.current = { id: getEventId(event), startMs: getEventStartMs(event) };
    setResizeTarget({ id: getEventId(event), newEndMs: getEventEndMs(event) });
  }, []);

  const handleResizeMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const ri = resizeInfoRef.current;
      if (!ri) return;
      const gridDiv = gridRef.current;
      if (!gridDiv) return;
      const rect = gridDiv.getBoundingClientRect();
      const yInGrid = Math.max(0, Math.min(e.clientY - rect.top, TOTAL_HEIGHT));
      const totalMin = (yInGrid / DAY_HOUR_HEIGHT) * 60;
      const snappedMin = Math.round(totalMin / SNAP_MIN) * SNAP_MIN;
      const [y, m, d] = dateStr.split('-').map(Number);
      const rawEndMs = Date.UTC(y, m - 1, d) + (DAY_START_HOUR * 60 + snappedMin) * 60000;
      const minEndMs = ri.startMs + SNAP_MIN * 60000;
      const maxEndMs = Date.UTC(y, m - 1, d) + DAY_END_HOUR * 3600000;
      const newEndMs = Math.max(minEndMs, Math.min(rawEndMs, maxEndMs));
      setResizeTarget((prev) =>
        prev && prev.newEndMs === newEndMs ? prev : { id: ri.id, newEndMs },
      );
    },
    [dateStr],
  );

  const handleResizeEnd = useCallback(
    (_e: React.PointerEvent<HTMLDivElement>) => {
      if (!resizeInfoRef.current) return;
      setResizeTarget((rt) => {
        if (rt) {
          const event = events.find((ev) => getEventId(ev) === rt.id);
          if (event) dispatch(updateEventThunk(withEventTime(event, getEventStartMs(event), rt.newEndMs)));
        }
        return null;
      });
      resizeInfoRef.current = null;
    },
    [events, dispatch],
  );

  // ── Drag handlers ────────────────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, event: IEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const grabOffsetMin =
      Math.round((((e.clientY - rect.top) / DAY_HOUR_HEIGHT) * 60) / SNAP_MIN) * SNAP_MIN;
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!dragState) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const gridDiv = gridRef.current;
    if (!gridDiv) return;
    const rect = gridDiv.getBoundingClientRect();
    const yInGrid = Math.max(0, Math.min(e.clientY - rect.top, TOTAL_HEIGHT));
    const totalMin = (yInGrid / DAY_HOUR_HEIGHT) * 60;
    const grabOffsetMin = dragState.type === 'timed' ? dragState.grabOffsetMin : 0;
    const durationMs = dragState.type === 'timed' ? dragState.durationMs : DEFAULT_TIMED_DURATION;
    const newStartMin = totalMin - grabOffsetMin;
    const snappedMin = Math.round(newStartMin / SNAP_MIN) * SNAP_MIN;
    const durationMin = durationMs / 60000;
    const clampedMin = Math.max(
      0,
      Math.min(snappedMin, (DAY_END_HOUR - DAY_START_HOUR) * 60 - durationMin),
    );
    const [y, m, d] = dateStr.split('-').map(Number);
    const newStartMs = Date.UTC(y, m - 1, d) + (DAY_START_HOUR * 60 + clampedMin) * 60000;
    if (dragTarget !== newStartMs) setDragTarget(newStartMs);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragTarget(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dragState || dragTarget === null) return;
    const event = events.find((ev) => getEventId(ev) === dragState.id);
    if (event) {
      const durationMs =
        dragState.type === 'timed' ? dragState.durationMs : DEFAULT_TIMED_DURATION;
      dispatch(updateEventThunk(withEventTime(event, dragTarget, dragTarget + durationMs)));
    }
    resetDrag();
  };

  // ── Preview cards ────────────────────────────────────────────────────────────

  let dragPreview: React.ReactNode = null;
  if (dragTarget !== null && dragState) {
    const src = events.find((ev) => getEventId(ev) === dragState.id);
    if (src) {
      const durationMs =
        dragState.type === 'timed' ? dragState.durationMs : DEFAULT_TIMED_DURATION;
      const [psh, psm] = clampHour(...msToUtcHM(dragTarget), DAY_START_HOUR, DAY_END_HOUR);
      const [peh, pem] = clampHour(
        ...msToUtcHM(dragTarget + durationMs),
        DAY_START_HOUR,
        DAY_END_HOUR,
      );
      const pStart = toTimeString(psh, psm);
      const pEnd = toTimeString(peh, pem);
      if (pStart !== pEnd) {
        dragPreview = (
          <WeekEventCard
            title={src.title}
            startTime={pStart}
            endTime={pEnd}
            color={getResolvedEventLabelColor(src, labelColorMap, DEFAULT_COLOR)}
            offsetTop={timeToOffset(pStart, DAY_START_HOUR, DAY_HOUR_HEIGHT)}
            height={durationToHeight(pStart, pEnd, DAY_HOUR_HEIGHT)}
            className='pointer-events-none z-20 ring-2 ring-inset ring-current'
            style={{ opacity: 0.75 }}
          />
        );
      }
    }
  }

  let resizePreview: React.ReactNode = null;
  if (resizeTarget && resizeInfoRef.current) {
    const src = events.find((ev) => getEventId(ev) === resizeTarget.id);
    if (src) {
      const [psh, psm] = clampHour(...msToUtcHM(getEventStartMs(src)), DAY_START_HOUR, DAY_END_HOUR);
      const [peh, pem] = clampHour(
        ...msToUtcHM(resizeTarget.newEndMs),
        DAY_START_HOUR,
        DAY_END_HOUR,
      );
      const pStart = toTimeString(psh, psm);
      const pEnd = toTimeString(peh, pem);
      if (pStart !== pEnd) {
        resizePreview = (
          <WeekEventCard
            title={src.title}
            startTime={pStart}
            endTime={pEnd}
            color={getResolvedEventLabelColor(src, labelColorMap, DEFAULT_COLOR)}
            offsetTop={timeToOffset(pStart, DAY_START_HOUR, DAY_HOUR_HEIGHT)}
            height={durationToHeight(pStart, pEnd, DAY_HOUR_HEIGHT)}
            className='pointer-events-none z-20 ring-2 ring-inset ring-current'
            style={{ opacity: 0.75 }}
          />
        );
      }
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div
      ref={gridRef}
      className='relative'
      style={{ height: TOTAL_HEIGHT }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPointerMove={handleResizeMove}
      onPointerUp={handleResizeEnd}
      onPointerCancel={handleResizeEnd}>
      {HOURS.map((h) => (
        <div
          key={h}
          className='absolute w-full border-b border-outline-variant/30'
          style={{ top: (h - DAY_START_HOUR) * DAY_HOUR_HEIGHT }}
        />
      ))}

      <div className='absolute inset-0'>
        {timedEvents.map((event) => {
          const eventId = getEventId(event);
          const start = getEventStartMs(event);
          const end = getEventEndMs(event);
          const [sh, sm] = clampHour(...msToUtcHM(start), DAY_START_HOUR, DAY_END_HOUR);
          const [eh, em] = clampHour(...msToUtcHM(end), DAY_START_HOUR, DAY_END_HOUR);
          const startTime = toTimeString(sh, sm);
          const endTime = toTimeString(eh, em);
          if (startTime === endTime) return null;
          const color = getResolvedEventLabelColor(event, labelColorMap, DEFAULT_COLOR);
          const isDragging = dragState?.id === eventId;
          const isResizing = resizeTarget?.id === eventId;
          const layout = eventLayouts.get(eventId);
          const overlapStyle: React.CSSProperties =
            layout && layout.totalCols > 1
              ? {
                  left: `calc(${(layout.col / layout.totalCols) * 100}% + 4px)`,
                  right: `calc(${((layout.totalCols - layout.col - 1) / layout.totalCols) * 100}% + 4px)`,
                  zIndex: layout.col + 1,
                }
              : {};
          return (
            <DayEventCard
              key={eventId}
              event={{
                id: eventId,
                title: event.title,
                date: dateStr,
                startTime,
                endTime,
                description: event.description,
              }}
              color={color}
              offsetTop={timeToOffset(startTime, DAY_START_HOUR, DAY_HOUR_HEIGHT)}
              height={durationToHeight(startTime, endTime, DAY_HOUR_HEIGHT)}
              draggable={!isResizing}
              className={cn(
                isDragging || isResizing ? 'opacity-40' : '',
                isDragging ? 'cursor-grabbing' : 'cursor-grab',
              )}
              style={overlapStyle}
              onDragStart={(e) => handleDragStart(e, event)}
              onDragEnd={resetDrag}
              onResizeStart={(e) => handleResizeStart(e, event)}
              onClick={(e) => {
                e.stopPropagation();
                if (!dragState && !resizeTarget) onEventClick?.(event);
              }}
            />
          );
        })}

        {dragPreview}
        {resizePreview}

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
};
