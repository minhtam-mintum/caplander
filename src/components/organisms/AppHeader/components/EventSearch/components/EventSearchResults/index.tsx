import type { MouseEvent } from 'react';
import { GhostButton } from 'app/components/molecules/Buttons/GhostButton';
import type { IEvent } from 'app/store/slices/eventSlice';

interface IEventSearchResultsProps {
  events: IEvent[];
  onEventSelect: (event: IEvent) => void;
}

export function EventSearchResults({ events, onEventSelect }: IEventSearchResultsProps) {
  return (
    <div className='absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-outline-variant overflow-hidden z-50'>
      {events.map((event) => {
        const handleMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          onEventSelect(event);
        };

        return (
          <GhostButton
            key={event.id}
            className='w-full! justify-between rounded-none! px-4! py-2.5! text-left hover:bg-surface-container-high!'
            onMouseDown={handleMouseDown}>
            <span className='flex-1 text-body-md text-on-surface truncate'>{event.name}</span>
            <span className='text-label-sm text-on-surface-variant shrink-0'>
              {new Date(event.start).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </GhostButton>
        );
      })}
    </div>
  );
}
