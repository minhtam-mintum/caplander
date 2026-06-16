import { GhostButton } from 'app/components/molecules/Buttons/GhostButton';
import { formatRelativeTime, stripHtml } from 'app/components/organisms/AppHeader/components/NotificationPanel/utils';
import type { IEvent } from 'app/store/slices/eventSlice';

interface INotificationItemProps {
  event: IEvent;
  isUnread: boolean;
  onClick: (event: IEvent) => void;
}

export function NotificationItem({ event, isUnread, onClick }: INotificationItemProps) {
  const plainNotes = stripHtml(event.notes);

  return (
    <GhostButton
      className='w-full! items-start justify-start gap-3! rounded-none! px-4! py-3! text-left hover:bg-surface-container!'
      onClick={() => onClick(event)}>
      <span
        className={`mt-1.5 size-2 rounded-full shrink-0 ${isUnread ? 'bg-primary' : 'bg-transparent'}`}
      />
      <div className='min-w-0 flex-1'>
        <p className='text-body-sm font-semibold text-on-surface truncate'>{event.name}</p>
        {plainNotes && (
          <p className='text-body-sm text-on-surface-variant truncate'>{plainNotes}</p>
        )}
        <p className='text-label-sm text-on-surface-variant mt-0.5'>
          {formatRelativeTime(event.start)}
        </p>
      </div>
    </GhostButton>
  );
}
