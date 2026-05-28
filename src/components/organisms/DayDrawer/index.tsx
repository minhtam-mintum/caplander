import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, Plus } from 'lucide-react';
import type { IEvent } from 'app/store/slices/eventSlice';
import { DismissButton } from 'app/components/molecules/Buttons/DismissButton';
import { DashedButton } from 'app/components/molecules/Buttons/DashedButton';
import { MONTH_NAMES } from 'app/utils/calendar';
import { lockScroll, unlockScroll } from 'app/utils/scrollLock';
import { useAppSelector } from 'app/store';

export interface IDayDrawerHandle {
  open: (date: Date) => void;
  close: () => void;
}

interface IDayDrawerProps {
  onAddEvent: (date: Date) => void;
  onEventClick: (event: IEvent) => void;
}

function formatDatetime(ms: number): string {
  const d = new Date(ms);
  const month = MONTH_NAMES[d.getUTCMonth()].slice(0, 3);
  const day = d.getUTCDate();
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${month} ${day}, ${h}:${m}`;
}

function formatHeaderDate(date: Date): string {
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${mm}/${dd}/${date.getUTCFullYear()}`;
}

export const DayDrawer = forwardRef<IDayDrawerHandle, IDayDrawerProps>(function DayDrawer(
  { onAddEvent, onEventClick },
  ref,
) {
  const events = useAppSelector((state) => state.events.items);

  const [date, setDate] = useState<Date | null>(null);
  const isOpen = date != null;

  useImperativeHandle(
    ref,
    () => ({
      open: (d) => setDate(d),
      close: () => setDate(null),
    }),
    [],
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDate(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      lockScroll();
      return unlockScroll;
    }
  }, [isOpen]);

  const dayEvents = useMemo(() => {
    if (!date) return [];
    const dayUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return events.filter((e) => {
      const startDay = Math.floor(e.start / 86400000) * 86400000;
      const endDay = Math.floor(e.end / 86400000) * 86400000;
      return startDay <= dayUTC && dayUTC <= endDay;
    });
  }, [date, events]);

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setDate(null)}
      />
      <div
        className={`fixed top-0 right-0 h-full w-90 z-50 bg-surface-container-lowest shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className='flex items-center justify-between px-5 py-4'>
          <span className='text-body-md font-semibold text-on-surface-variant'>
            {date ? formatHeaderDate(date) : ''}
          </span>
          <DismissButton onClick={() => setDate(null)} />
        </div>
        <div className='h-px bg-outline-variant' />

        <div className='flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3'>
          {dayEvents.map((event) => (
            <EventItem key={event.id} event={event} onClick={() => onEventClick(event)} />
          ))}
          <DashedButton type='button' onClick={() => date && onAddEvent(date)}>
            <Plus size={16} />
            Add Event
          </DashedButton>
        </div>
      </div>
    </>,
    document.body,
  );
});

// ─── EventItem ────────────────────────────────────────────────────────────────

interface IEventItemProps {
  event: IEvent;
  onClick: () => void;
}

function EventItem({ event, onClick }: IEventItemProps) {
  return (
    <div
      className='bg-surface-container rounded-xl px-4 py-3 flex flex-col gap-1 cursor-pointer hover:bg-surface-container-high transition-colors'
      onClick={onClick}>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='w-2 h-2 rounded-full bg-primary shrink-0' />
          <span className='text-label-sm font-semibold text-primary'>
            {formatDatetime(event.start)} — {formatDatetime(event.end)}
          </span>
        </div>
        <ChevronRight size={16} className='text-on-surface-variant shrink-0' />
      </div>
      <p className='text-body-sm font-semibold text-on-surface'>{event.name}</p>
    </div>
  );
}
