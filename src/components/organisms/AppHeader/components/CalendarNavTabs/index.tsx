import { forwardRef, useImperativeHandle } from 'react';
import { Calendar, CalendarDays, CalendarRange, LayoutGrid } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from 'app/constants/route';
import { NavTabs, type NavTab } from 'app/components/molecules/NavTabs';

const CALENDAR_TABS: NavTab[] = [
  { id: ROUTES.YEAR, label: 'Year View', icon: <LayoutGrid size={14} /> },
  { id: ROUTES.MONTH, label: 'Month View', icon: <CalendarDays size={14} /> },
  { id: ROUTES.WEEK, label: 'Week View', icon: <CalendarRange size={14} /> },
  { id: ROUTES.DAY, label: 'Day View', icon: <Calendar size={14} /> },
];

export interface ICalendarNavTabsHandle {
  getActiveView: () => string;
}

export const CalendarNavTabs = forwardRef<ICalendarNavTabsHandle>(function CalendarNavTabs(_, ref) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeView = CALENDAR_TABS.some((t) => t.id === pathname) ? pathname : ROUTES.MONTH;

  useImperativeHandle(ref, () => ({ getActiveView: () => activeView }), [activeView]);

  return <NavTabs tabs={CALENDAR_TABS} active={activeView} onChange={navigate} />;
});
