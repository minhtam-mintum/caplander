import { useState, useMemo } from 'react';
import { cn } from 'app/utils/cn';
import { dayToDateStr } from 'app/pages/WeekView/utils';
import { DAY_MS, MAX_LANES } from 'app/pages/MonthView/utils';
import { ALL_DAY_GAP, ALL_DAY_PAD, ALL_DAY_ROW_H, DEFAULT_COLOR } from 'app/pages/WeekView/const';
import { useAppDispatch, useAppSelector } from 'app/store';
import { updateEventThunk } from 'app/store/slices/eventSlice';
import type { IEvent } from 'app/store/slices/eventSlice';
import type { BarItem } from 'app/pages/MonthView/types';
import type { DragInfo } from 'app/pages/WeekView/types';
import { getEventEndMs, getEventId, getEventLabelId, getEventStartMs, withEventTime } from 'app/utils/event';

interface IAllDayRowProps {
  weekDays: Date[];
  allDayLayout: { visibleBars: BarItem[]; overflowByCol: number[] };
  allDayHeight: number;
  labelColorMap: Record<string, string>;
  onEventClick?: (event: IEvent) => void;
  dragInfo: DragInfo | null;
  onDragStart: (info: DragInfo) => void;
  onDragEnd: () => void;
}

export const AllDayRow = ({
  weekDays,
  allDayLayout,
  allDayHeight,
  labelColorMap,
  onEventClick,
  dragInfo,
  onDragStart,
  onDragEnd,
}: IAllDayRowProps) => {
  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.events.items);
  const [dragOverDs, setDragOverDs] = useState<string | null>(null);

  const dropRange = useMemo<[number, number] | null>(() => {
    if (!dragInfo || !dragOverDs) return null;
    if (dragInfo.type === 'timed') {
      const [y, m, d] = dragOverDs.split('-').map(Number);
      const cellUtc = Date.UTC(y, m - 1, d);
      return [cellUtc, cellUtc];
    }
    const [y, m, d] = dragOverDs.split('-').map(Number);
    const drop = new Date(y, m - 1, d);
    drop.setDate(drop.getDate() - dragInfo.grabOffset);
    const newStartUtc = Date.UTC(drop.getFullYear(), drop.getMonth(), drop.getDate());
    return [newStartUtc, newStartUtc + (dragInfo.span - 1) * DAY_MS];
  }, [dragInfo, dragOverDs]);

  const resetDrag = () => {
    onDragEnd();
    setDragOverDs(null);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, bar: BarItem) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cellW = rect.width / bar.span;
    const dayInBar = Math.min(
      bar.span - 1,
      Math.max(0, Math.floor((e.clientX - rect.left) / cellW)),
    );
    const grabbed = new Date(weekDays[0]);
    grabbed.setDate(weekDays[0].getDate() + (bar.startCol - 1) + dayInBar);
    const grabbedUtc = Date.UTC(grabbed.getFullYear(), grabbed.getMonth(), grabbed.getDate());
    const grabOffset = Math.round((grabbedUtc - bar.evStartMs) / DAY_MS);
    onDragStart({ type: 'allDay', id: getEventId(bar.ev), grabOffset, span: bar.evSpan });
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', getEventId(bar.ev));
    } catch {
      /* */
    }
  };

  const handleDragOverCell = (e: React.DragEvent<HTMLDivElement>, ds: string) => {
    if (!dragInfo) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDs !== ds) setDragOverDs(ds);
  };

  const handleDragLeaveCell = (e: React.DragEvent<HTMLDivElement>, ds: string) => {
    if (dragOverDs === ds && !e.currentTarget.contains(e.relatedTarget as Node))
      setDragOverDs(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, cellDate: Date) => {
    e.preventDefault();
    if (!dragInfo) return;
    const event = events.find((ev) => getEventId(ev) === dragInfo.id);
    if (event) {
      if (dragInfo.type === 'allDay') {
        const shifted = new Date(cellDate);
        shifted.setDate(cellDate.getDate() - dragInfo.grabOffset);
        const newStartUtcMs = Date.UTC(
          shifted.getFullYear(),
          shifted.getMonth(),
          shifted.getDate(),
        );
        dispatch(
          updateEventThunk(
            withEventTime(event, newStartUtcMs, newStartUtcMs + (getEventEndMs(event) - getEventStartMs(event))),
          ),
        );
      } else {
        const newStartUtcMs = Date.UTC(
          cellDate.getFullYear(),
          cellDate.getMonth(),
          cellDate.getDate(),
        );
        dispatch(updateEventThunk(withEventTime(event, newStartUtcMs, newStartUtcMs + DAY_MS)));
      }
    }
    onDragEnd();
    setDragOverDs(null);
  };

  return (
    <div
      className='flex shrink-0 relative border-b border-outline-variant'
      style={{ height: allDayHeight }}>
      {weekDays.map((day) => {
        const dateStr = dayToDateStr(day);
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        const cellUtc = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());
        const inRange = !!dropRange && cellUtc >= dropRange[0] && cellUtc <= dropRange[1];
        return (
          <div
            key={dateStr}
            className={cn(
              'flex-1 min-w-24 border-l first:border-l-0 border-outline-variant transition-colors',
              isWeekend && 'bg-surface-container-low/40',
              inRange && 'bg-primary/10',
            )}
            onDragOver={(e) => handleDragOverCell(e, dateStr)}
            onDragLeave={(e) => handleDragLeaveCell(e, dateStr)}
            onDrop={(e) => handleDrop(e, day)}
          />
        );
      })}
      <div
        className='absolute inset-0 pointer-events-none'
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(96px, 1fr))',
          gridAutoRows: `${ALL_DAY_ROW_H}px`,
          rowGap: `${ALL_DAY_GAP}px`,
          padding: `${ALL_DAY_PAD}px 0`,
        }}>
        {allDayLayout.visibleBars.map((bar, bi) => {
          const eventId = getEventId(bar.ev);
          const color = labelColorMap[getEventLabelId(bar.ev)] ?? DEFAULT_COLOR;
          const isDragging = dragInfo?.id === eventId;
          return (
            <div
              key={`${eventId}-${bi}`}
              draggable
              className={cn(
                'pointer-events-auto flex items-center px-2 text-[12px] font-medium overflow-hidden whitespace-nowrap transition-all select-none',
                bar.startsBefore ? 'rounded-l-none' : 'rounded-l-md',
                bar.endsAfter ? 'rounded-r-none' : 'rounded-r-md',
                isDragging ? 'opacity-40 cursor-grabbing' : 'cursor-grab hover:brightness-95',
              )}
              style={{
                gridColumn: `${bar.startCol} / span ${bar.span}`,
                gridRow: bar.lane + 1,
                background: `color-mix(in srgb, ${color} 18%, transparent)`,
                color,
                marginLeft: bar.startsBefore ? 0 : 4,
                marginRight: bar.endsAfter ? 0 : 4,
              }}
              onDragStart={(e) => handleDragStart(e, bar)}
              onDragEnd={resetDrag}
              onClick={(e) => {
                e.stopPropagation();
                if (!dragInfo) onEventClick?.(bar.ev);
              }}>
              <span className='overflow-hidden text-ellipsis'>
                {bar.startsBefore && '‹ '}
                {bar.ev.title}
                {bar.endsAfter && ' ›'}
              </span>
            </div>
          );
        })}
        {weekDays.map((_, ci) => {
          const count = allDayLayout.overflowByCol[ci + 1] ?? 0;
          if (count === 0) return null;
          return (
            <div
              key={`overflow-${ci}`}
              className='pointer-events-none flex items-center text-[11px] font-medium text-on-surface-variant pl-1'
              style={{ gridColumn: ci + 1, gridRow: MAX_LANES + 1 }}>
              +{count} more
            </div>
          );
        })}
      </div>
    </div>
  );
};
