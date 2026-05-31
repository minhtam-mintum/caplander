import { useCallback, useRef, useState } from 'react';
import { Bell, Calendar, CalendarDays, CalendarRange, LayoutGrid, Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from 'app/constants/route';
import { useAppSelector } from 'app/store';
import type { IEvent } from 'app/store/slices/eventSlice';
import { Avatar } from 'app/components/atoms/Avatar';
import { Button } from 'app/components/atoms/Button';
import { IconButton } from 'app/components/molecules/Buttons/IconButton';
import { Logo } from 'app/components/atoms/Logo';
import { NavTabs, type NavTab } from 'app/components/molecules/NavTabs';
import { EventModal, IEventModalHandle, type EventFormData } from 'app/components/organisms/EventModal';
import { NotificationPanel } from 'app/components/organisms/NotificationPanel';
import { EventSearch } from './EventSearch';

const CALENDAR_TABS: NavTab[] = [
  { id: ROUTES.YEAR, label: 'Year View', icon: <LayoutGrid size={14} /> },
  { id: ROUTES.MONTH, label: 'Month View', icon: <CalendarDays size={14} /> },
  { id: ROUTES.WEEK, label: 'Week View', icon: <CalendarRange size={14} /> },
  { id: ROUTES.DAY, label: 'Day View', icon: <Calendar size={14} /> },
];

export function AppHeader() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const eventModalRef = useRef<IEventModalHandle>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const activeView = CALENDAR_TABS.some((t) => t.id === pathname) ? pathname : ROUTES.MONTH;

  const events = useAppSelector((state) => state.events.items);
  const readIds = useAppSelector((state) => state.notifications.readIds);
  const now = Date.now();
  const unreadCount = events.filter(
    (e) => e.start > now - 3600000 && !readIds.includes(e.id),
  ).length;

  const handleEventClick = useCallback((data: Partial<EventFormData>) => {
    eventModalRef.current?.open(data);
  }, []);

  const handleSearchSelect = useCallback(
    (event: IEvent) => {
      navigate(activeView, { state: { seekDate: event.start } });
      eventModalRef.current?.open({
        id: event.id,
        name: event.name,
        startDate: new Date(Math.floor(event.start / 86400000) * 86400000),
        startTime: event.start % 86400000,
        endDate: new Date(Math.floor(event.end / 86400000) * 86400000),
        endTime: event.end % 86400000,
        alert: event.alert,
        label: event.label,
        notes: event.notes,
      });
    },
    [activeView, navigate],
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
              <div className='relative'>
                <IconButton
                  ref={bellRef}
                  aria-label='Notifications'
                  onClick={() => setPanelOpen((o) => !o)}>
                  <Bell size={18} />
                </IconButton>
                {unreadCount > 0 && (
                  <span className='absolute -top-0.5 -right-0.5 size-4 rounded-full bg-error text-on-error text-label-sm flex items-center justify-center pointer-events-none'>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <Avatar initials='MT' />
            </div>
          </div>
          <div className='pb-0.5'>
            <NavTabs tabs={CALENDAR_TABS} active={activeView} onChange={navigate} />
          </div>
        </div>
      </header>
      {panelOpen && (
        <NotificationPanel
          anchorRef={bellRef}
          onClose={() => setPanelOpen(false)}
          onEventClick={handleEventClick}
        />
      )}
    </>
  );
}
