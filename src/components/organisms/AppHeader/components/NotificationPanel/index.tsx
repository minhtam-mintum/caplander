import { memo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell } from 'lucide-react';
import { useAppDispatch, useAppSelector } from 'app/store';
import { markAsRead, markAllAsRead } from 'app/store/slices/notificationSlice';
import type { IEvent } from 'app/store/slices/eventSlice';
import { IconButton } from 'app/components/molecules/Buttons/IconButton';
import type { EventFormData } from 'app/components/organisms/EventModal';
import { formatRelativeTime, stripHtml, toFormData } from './utils';

interface INotificationPanelProps {
  onEventClick: (data: Partial<EventFormData>) => void;
}

export const NotificationPanel = memo(function NotificationPanel({
  onEventClick,
}: INotificationPanelProps) {
  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.events.items);
  const readIds = useAppSelector((state) => state.notifications.readIds);
  const notifiedIds = useAppSelector((state) => state.notifications.notifiedIds);
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const upcoming = events.filter((e) => notifiedIds.includes(e.id)).slice().reverse();
  const unreadCount = upcoming.filter((e) => !readIds.includes(e.id)).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        bellRef.current &&
        !bellRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (event: IEvent) => {
    dispatch(markAsRead(event.id));
    setOpen(false);
    onEventClick(toFormData(event));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead(upcoming.map((e) => e.id)));
  };

  const anchorRect = bellRef.current?.getBoundingClientRect();
  const top = anchorRect ? anchorRect.bottom + window.scrollY + 8 : 0;
  const right = anchorRect ? window.innerWidth - anchorRect.right : 0;

  return (
    <>
      <div className='relative'>
        <IconButton ref={bellRef} aria-label='Notifications' onClick={() => setOpen((o) => !o)}>
          <Bell size={18} />
        </IconButton>
        {unreadCount > 0 && (
          <span className='absolute -top-0.5 -right-0.5 size-4 rounded-full bg-error text-on-error text-label-sm flex items-center justify-center pointer-events-none'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>
      {open &&
        anchorRect &&
        createPortal(
          <div
            ref={panelRef}
            className='fixed z-40 w-72 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant overflow-hidden'
            style={{ top, right }}>
            <div className='flex items-center justify-between px-4 py-3 border-b border-outline-variant'>
              <h3 className='text-title-sm font-semibold text-on-surface'>Notifications</h3>
              <button
                className='text-label-sm text-primary hover:underline'
                onClick={handleMarkAllRead}>
                Mark all as read
              </button>
            </div>
            <div className='max-h-96 overflow-y-auto divide-y divide-outline-variant'>
              {upcoming.length === 0 ? (
                <p className='px-4 py-6 text-body-sm text-on-surface-variant text-center'>
                  No events
                </p>
              ) : (
                upcoming.map((event) => {
                  const isUnread = !readIds.includes(event.id);
                  const plainNotes = stripHtml(event.notes);
                  return (
                    <button
                      key={event.id}
                      className='w-full text-left px-4 py-3 hover:bg-surface-container transition-colors flex items-start gap-3'
                      onClick={() => handleItemClick(event)}>
                      <span
                        className={`mt-1.5 size-2 rounded-full shrink-0 ${isUnread ? 'bg-primary' : 'bg-transparent'}`}
                      />
                      <div className='min-w-0 flex-1'>
                        <p className='text-body-sm font-semibold text-on-surface truncate'>
                          {event.name}
                        </p>
                        {plainNotes && (
                          <p className='text-body-sm text-on-surface-variant truncate'>
                            {plainNotes}
                          </p>
                        )}
                        <p className='text-label-sm text-on-surface-variant mt-0.5'>
                          {formatRelativeTime(event.start)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
});
