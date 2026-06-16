import { forwardRef } from 'react';
import { GhostButton } from 'app/components/molecules/Buttons/GhostButton';
import { NotificationItem } from 'app/components/organisms/AppHeader/components/NotificationPanel/components/NotificationItem';
import type { IEvent } from 'app/store/slices/eventSlice';

interface INotificationDropdownProps {
  events: IEvent[];
  readIds: string[];
  top: number;
  right: number;
  onEventClick: (event: IEvent) => void;
  onMarkAllRead: () => void;
}

export const NotificationDropdown = forwardRef<HTMLDivElement, INotificationDropdownProps>(
  function NotificationDropdown(
    { events, readIds, top, right, onEventClick, onMarkAllRead },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className='fixed z-40 w-72 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant overflow-hidden'
        style={{ top, right }}>
        <div className='flex items-center justify-between px-4 py-3 border-b border-outline-variant'>
          <h3 className='text-title-sm font-semibold text-on-surface'>Notifications</h3>
          <GhostButton
            className='rounded-sm! px-0! py-0! text-label-sm text-primary hover:bg-transparent! hover:underline'
            onClick={onMarkAllRead}>
            Mark all as read
          </GhostButton>
        </div>
        <div className='max-h-96 overflow-y-auto divide-y divide-outline-variant'>
          {events.length === 0 ? (
            <p className='px-4 py-6 text-body-sm text-on-surface-variant text-center'>No events</p>
          ) : (
            events.map((event) => (
              <NotificationItem
                key={event.id}
                event={event}
                isUnread={!readIds.includes(event.id)}
                onClick={onEventClick}
              />
            ))
          )}
        </div>
      </div>
    );
  },
);
