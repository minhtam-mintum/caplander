import { useAppSelector } from 'app/store';

export function EventFetchProgress() {
  const isFetchingEvents = useAppSelector((state) => Boolean(state.events.loading));

  return (
    <div
      className='h-0.5 overflow-hidden bg-transparent'
      role={isFetchingEvents ? 'status' : undefined}
      aria-live='polite'
      aria-label={isFetchingEvents ? 'Loading events' : undefined}>
      {isFetchingEvents ? (
        <>
          <span className='sr-only'>Loading events</span>
          <div className='h-full w-full rounded-full bg-primary animate-loading-bar' />
        </>
      ) : null}
    </div>
  );
}
