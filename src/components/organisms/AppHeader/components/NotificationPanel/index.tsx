import { memo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell } from 'lucide-react';
import { useAppDispatch, useAppSelector } from 'app/store';
import { markAsRead, markAllAsRead } from 'app/store/slices/notificationSlice';
import type { IEvent } from 'app/store/slices/eventSlice';
import { IconButton } from 'app/components/molecules/Buttons/IconButton';
import { NotificationDropdown } from 'app/components/organisms/AppHeader/components/NotificationPanel/components/NotificationDropdown';
import type { EventFormData } from 'app/components/organisms/EventModal';
import { toFormData } from './utils';
import { getEventId } from 'app/utils/event';

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

  const upcoming = events.filter((e) => notifiedIds.includes(getEventId(e))).slice().reverse();
  const unreadCount = upcoming.filter((e) => !readIds.includes(getEventId(e))).length;

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
    dispatch(markAsRead(getEventId(event)));
    setOpen(false);
    onEventClick(toFormData(event));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead(upcoming.map(getEventId)));
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
          <NotificationDropdown
            ref={panelRef}
            events={upcoming}
            readIds={readIds}
            top={top}
            right={right}
            onEventClick={handleItemClick}
            onMarkAllRead={handleMarkAllRead}
          />,
          document.body,
        )}
    </>
  );
});
