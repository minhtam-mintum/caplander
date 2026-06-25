import { useState } from 'react';
import { cn } from 'app/utils/cn';
import { useAppDispatch, useAppSelector } from 'app/store';
import { updateEventThunk } from 'app/store/slices/eventSlice';
import type { IEvent } from 'app/store/slices/eventSlice';
import { ALL_DAY_GAP, ALL_DAY_PAD, ALL_DAY_ROW_H, DEFAULT_COLOR } from 'app/pages/WeekView/const';
import { DAY_MS } from 'app/pages/MonthView/utils';
import type { DayDragState } from './types';
import { getEventId, getResolvedEventLabelColor, withEventTime } from 'app/utils/event';

interface IDayAllDayRowProps {
  dateStr: string;
  allDayEvents: IEvent[];
  allDayHeight: number;
  labelColorMap: Record<string, string>;
  dragState: DayDragState | null;
  onEventClick?: (event: IEvent) => void;
  onDragStart: (state: DayDragState) => void;
  onDragEnd: () => void;
}

export const DayAllDayRow = ({
  dateStr,
  allDayEvents,
  allDayHeight,
  labelColorMap,
  dragState,
  onEventClick,
  onDragStart,
  onDragEnd,
}: IDayAllDayRowProps) => {
  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.events.items);
  const [dropActive, setDropActive] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, event: IEvent) => {
    onDragStart({ type: 'allDay', id: getEventId(event) });
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
    setDropActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dragState) return;
    if (dragState.type === 'timed') {
      const event = events.find((ev) => getEventId(ev) === dragState.id);
      if (event) {
        const [y, m, d] = dateStr.split('-').map(Number);
        const newStartMs = Date.UTC(y, m - 1, d);
        dispatch(updateEventThunk(withEventTime(event, newStartMs, newStartMs + DAY_MS)));
      }
    }
    setDropActive(false);
    onDragEnd();
  };

  return (
    <div
      className={cn(
        'shrink-0 border-b border-outline-variant transition-colors',
        dropActive && 'bg-primary/10',
      )}
      style={{ height: allDayHeight, paddingRight: 'var(--day-scrollbar-gutter)' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}>
      <div className='flex flex-col' style={{ gap: ALL_DAY_GAP, padding: ALL_DAY_PAD }}>
        {allDayEvents.map((event) => {
          const eventId = getEventId(event);
          const color = getResolvedEventLabelColor(event, labelColorMap, DEFAULT_COLOR);
          const isDragging = dragState?.id === eventId;
          return (
            <div
              key={eventId}
              draggable
              className={cn(
                'rounded-md px-2 flex items-center overflow-hidden select-none transition-all',
                isDragging ? 'opacity-40 cursor-grabbing' : 'cursor-grab hover:brightness-95',
              )}
              style={{
                height: ALL_DAY_ROW_H,
                background: `color-mix(in srgb, ${color} 18%, transparent)`,
                color,
              }}
              onDragStart={(e) => handleDragStart(e, event)}
              onDragEnd={onDragEnd}
              onClick={(e) => {
                e.stopPropagation();
                if (!dragState) onEventClick?.(event);
              }}>
              <span className='text-[12px] font-medium truncate'>{event.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
