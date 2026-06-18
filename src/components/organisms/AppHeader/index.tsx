import { useCallback, useRef } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from 'app/constants/route';
import type { IEvent } from 'app/store/slices/eventSlice';
import { Button } from 'app/components/atoms/Button';
import { Logo } from 'app/components/atoms/Logo';
import {
  EventModal,
  IEventModalHandle,
  type EventFormData,
} from 'app/components/organisms/EventModal';
import { AuthButton } from './components/AuthButton';
import { CalendarNavTabs, type ICalendarNavTabsHandle } from './components/CalendarNavTabs';
import { DarkModeToggle } from './components/DarkModeToggle';
import { EventFetchProgress } from './components/EventFetchProgress';
import { EventSearch } from './components/EventSearch';
import { NotificationPanel } from './components/NotificationPanel';
import { getEventFormData, getEventStartMs } from 'app/utils/event';

export function AppHeader() {
  const navigate = useNavigate();
  const eventModalRef = useRef<IEventModalHandle>(null);
  const navTabsRef = useRef<ICalendarNavTabsHandle>(null);

  const handleEventClick = useCallback((data: Partial<EventFormData>) => {
    eventModalRef.current?.open(data);
  }, []);

  const handleSearchSelect = useCallback(
    (event: IEvent) => {
      const activeView = navTabsRef.current?.getActiveView() || ROUTES.MONTH;
      navigate(activeView, { state: { seekDate: getEventStartMs(event) } });
      eventModalRef.current?.open(getEventFormData(event));
    },
    [navigate],
  );

  return (
    <>
      <EventModal ref={eventModalRef} />
      <header className='sticky top-0 z-10 bg-surface-container-lowest border-b border-outline-variant'>
        <div className='max-w-360 mx-auto px-margin'>
          <div className='flex items-center gap-4 h-14'>
            <Logo />
            <div className='w-85'>
              <EventSearch onEventSelect={handleSearchSelect} />
            </div>
            <div className='flex items-center gap-2 ml-auto shrink-0'>
              <Button
                variant='primary'
                onClick={() => {
                  eventModalRef.current?.open();
                }}>
                <Plus size={15} />
                Create Event
              </Button>
              <DarkModeToggle />
              <NotificationPanel onEventClick={handleEventClick} />
              <AuthButton />
            </div>
          </div>
          <div className='pb-0.5'>
            <CalendarNavTabs ref={navTabsRef} />
          </div>
        </div>
        <EventFetchProgress />
      </header>
    </>
  );
}
