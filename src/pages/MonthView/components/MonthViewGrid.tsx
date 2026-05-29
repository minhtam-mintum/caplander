import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  MonthCalendar,
  type IMonthCalendarHandle,
  type IRenderDayProps,
} from 'app/components/molecules/Calendar/components/MonthCalendar';
import type { IWeekCell } from 'app/components/molecules/Calendar/types';
import { cn } from 'app/utils/cn';
import { toDateStr } from 'app/utils/calendar';
import { updateEvent } from 'app/store/slices/eventSlice';
import { useAppDispatch, useAppSelector } from 'app/store';
import { useLabels } from 'app/hooks/useLabels';
import type {
  BarItem,
  DragInfo,
  IMonthViewGridHandle,
  IMonthViewGridProps,
} from 'app/pages/MonthView/types';
import { DAY_MS, MAX_LANES, dropShadow, layoutWeek } from '../utils';

export const MonthViewGrid = forwardRef<IMonthViewGridHandle, IMonthViewGridProps>(
  function MonthViewGrid({ defaultYear, defaultMonth, onDayClick, onEventClick }, ref) {
    const events = useAppSelector((state) => state.events.items);

    const calRef = useRef<IMonthCalendarHandle>(null);
    const dispatch = useAppDispatch();
    const { labels } = useLabels();
    const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
    const [dragOverDs, setDragOverDs] = useState<string | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        updateMonth: (y, m) => {
          calRef.current?.updateDate(new Date(y, m, 1));
        },
      }),
      [],
    );

    const labelColorMap = useMemo(
      () => Object.fromEntries(labels.map((l) => [l.value, l.color])),
      [labels],
    );

    const dropRange = useMemo<[number, number] | null>(() => {
      if (!dragInfo || !dragOverDs) return null;
      const [y, m, d] = dragOverDs.split('-').map(Number);
      const drop = new Date(y, m - 1, d);
      drop.setDate(drop.getDate() - dragInfo.grabOffset);
      const newStartUtc = Date.UTC(drop.getFullYear(), drop.getMonth(), drop.getDate());
      return [newStartUtc, newStartUtc + (dragInfo.span - 1) * DAY_MS];
    }, [dragInfo, dragOverDs]);

    const handleDragStart = (
      e: React.DragEvent<HTMLDivElement>,
      bar: BarItem,
      weekStartDate: Date,
    ) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const cellW = rect.width / bar.span;
      const dayInBar = Math.min(
        bar.span - 1,
        Math.max(0, Math.floor((e.clientX - rect.left) / cellW)),
      );
      const grabbed = new Date(weekStartDate);
      grabbed.setDate(weekStartDate.getDate() + (bar.startCol - 1) + dayInBar);
      const grabbedUtc = Date.UTC(grabbed.getFullYear(), grabbed.getMonth(), grabbed.getDate());
      const grabOffset = Math.round((grabbedUtc - bar.evStartMs) / DAY_MS);
      setDragInfo({ id: bar.ev.id, grabOffset, span: bar.evSpan });
      e.dataTransfer.effectAllowed = 'move';
      try {
        e.dataTransfer.setData('text/plain', bar.ev.id);
      } catch {
        /* */
      }
    };

    const handleDragEnd = () => {
      setDragInfo(null);
      setDragOverDs(null);
    };

    const handleDragOverCell = (e: React.DragEvent<HTMLDivElement>, ds: string) => {
      if (!dragInfo) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (dragOverDs !== ds) setDragOverDs(ds);
    };

    const handleDragLeaveCell = (e: React.DragEvent<HTMLDivElement>, ds: string) => {
      if (dragOverDs === ds && !e.currentTarget.contains(e.relatedTarget as Node)) {
        setDragOverDs(null);
      }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, cellDate: Date) => {
      e.preventDefault();
      if (!dragInfo) return;
      const shifted = new Date(cellDate);
      shifted.setDate(cellDate.getDate() - dragInfo.grabOffset);
      const newStartUtcMs = Date.UTC(shifted.getFullYear(), shifted.getMonth(), shifted.getDate());
      const event = events.find((ev) => ev.id === dragInfo.id);
      if (event) {
        const duration = event.end - event.start;
        dispatch(updateEvent({ ...event, start: newStartUtcMs, end: newStartUtcMs + duration }));
      }
      setDragInfo(null);
      setDragOverDs(null);
    };

    const renderDayLabel = (label: string, index: number) => (
      <div
        key={index}
        className={cn(
          'flex items-center text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant py-3 px-3.5 border-b border-outline-variant',
          index < 6 && 'border-r border-outline-variant',
        )}>
        {label}
      </div>
    );

    const renderDay = ({
      day,
      year: y,
      month: m,
      isCurrentMonth,
      isToday,
      isLastRow,
    }: IRenderDayProps) => {
      const date = new Date(y, m, day);
      const ds = toDateStr(y, m, day);
      const cellUtc = Date.UTC(y, m, day);
      const inRange = !!dropRange && cellUtc >= dropRange[0] && cellUtc <= dropRange[1];
      const isDropStart = inRange && cellUtc === dropRange![0];
      const isDropEnd = inRange && cellUtc === dropRange![1];
      const isLastCol = date.getDay() === 0;

      return (
        <div
          className={cn(
            'h-32 flex flex-col items-start p-2 transition-colors',
            !isLastRow && 'border-b border-outline-variant',
            !isLastCol && 'border-r border-outline-variant',
            isCurrentMonth
              ? 'bg-surface-container-lowest cursor-pointer hover:bg-surface-container-low/60'
              : 'bg-surface-container-low/40 cursor-default',
            inRange && 'bg-primary/10 hover:bg-primary/10',
          )}
          style={{ boxShadow: dropShadow(isDropStart, isDropEnd, inRange) }}
          onClick={() => isCurrentMonth && !dragInfo && onDayClick(new Date(Date.UTC(y, m, day)))}
          onDragOver={(e) => handleDragOverCell(e, ds)}
          onDragLeave={(e) => handleDragLeaveCell(e, ds)}
          onDrop={(e) => handleDrop(e, date)}>
          <span
            className={cn(
              'inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full text-[13px] font-medium tabular-nums',
              isToday
                ? 'bg-primary text-on-primary font-bold'
                : isCurrentMonth
                  ? inRange
                    ? 'text-primary font-semibold'
                    : 'text-on-surface-variant'
                  : 'text-on-surface-variant/40',
            )}>
            {day}
          </span>
        </div>
      );
    };

    const renderOverlay = (weekCells: IWeekCell[]) => {
      const weekDates = weekCells.map((c) => new Date(c.year, c.month, c.day));
      const layout = layoutWeek(weekDates, events);
      if (!layout.visibleBars.length && layout.overflowByCol.every((n) => n === 0)) return null;
      const weekStartDate = weekDates[0];

      return (
        <div
          className='absolute left-0 right-0 grid grid-cols-7 pointer-events-none'
          style={{ top: 36, gridAutoRows: '22px', rowGap: '2px', padding: 0 }}>
          {layout.visibleBars.map((bar, bi) => {
            const color = labelColorMap[bar.ev.label] ?? '#6366f1';
            const isDragging = dragInfo?.id === bar.ev.id;
            return (
              <div
                key={`${bar.ev.id}-${bi}`}
                draggable
                className={cn(
                  'pointer-events-auto flex items-center px-2 text-[12px] font-medium overflow-hidden whitespace-nowrap transition-all select-none',
                  bar.startsBefore ? 'rounded-l-none' : 'rounded-l-md',
                  bar.endsAfter ? 'rounded-r-none' : 'rounded-r-md',
                  isDragging ? 'opacity-40 cursor-grabbing' : 'cursor-grab hover:brightness-95',
                )}
                style={{
                  gridColumn: `${bar.startCol} / ${bar.endCol + 1}`,
                  gridRow: bar.lane + 1,
                  background: `color-mix(in srgb, ${color} 18%, transparent)`,
                  color,
                  marginLeft: bar.startsBefore ? 0 : 4,
                  marginRight: bar.endsAfter ? 0 : 4 + (9 - bar.endCol) / 2,
                }}
                onDragStart={(e) => handleDragStart(e, bar, weekStartDate)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => {
                  if (!dragInfo) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  const rect = e.currentTarget.getBoundingClientRect();
                  const barW = rect.width / bar.span;
                  const dayIndex = Math.min(bar.span - 1, Math.max(0, Math.floor((e.clientX - rect.left) / barW)));
                  const colIndex = bar.startCol - 1 + dayIndex;
                  const targetDate = weekDates[Math.min(colIndex, weekDates.length - 1)];
                  const ds = toDateStr(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
                  if (dragOverDs !== ds) setDragOverDs(ds);
                }}
                onDrop={(e) => {
                  if (!dragInfo) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const barW = rect.width / bar.span;
                  const dayIndex = Math.min(bar.span - 1, Math.max(0, Math.floor((e.clientX - rect.left) / barW)));
                  const colIndex = bar.startCol - 1 + dayIndex;
                  const targetDate = weekDates[Math.min(colIndex, weekDates.length - 1)];
                  handleDrop(e, targetDate);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!dragInfo) onEventClick(bar.ev);
                }}>
                <span className='overflow-hidden text-ellipsis'>
                  {bar.startsBefore ? '‹ ' : ''}
                  {bar.ev.name}
                  {bar.endsAfter ? ' ›' : ''}
                </span>
              </div>
            );
          })}
          {weekCells.map((_, ci) => {
            const count = layout.overflowByCol[ci + 1] ?? 0;
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
      );
    };

    return (
      <MonthCalendar
        ref={calRef}
        defaultDate={new Date(defaultYear, defaultMonth, 1)}
        hasMonthName={false}
        highlightToday={true}
        classCard='rounded-2xl border border-outline-variant overflow-hidden p-0 gap-0'
        classInner='flex flex-col'
        classDayLabelRow='grid grid-cols-7'
        classWeekGrid='grid grid-cols-7'
        renderDayLabel={renderDayLabel}
        renderDay={renderDay}
        renderOverlay={renderOverlay}
        labelFormat='full'
      />
    );
  },
);
