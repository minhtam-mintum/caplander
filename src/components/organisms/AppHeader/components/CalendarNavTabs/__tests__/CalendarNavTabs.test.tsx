import { createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarNavTabs, type ICalendarNavTabsHandle } from '../index';
import { renderWithProviders } from 'app/test/utils';
import { ROUTES } from 'app/constants/route';

describe('CalendarNavTabs', () => {
  it('renders all four calendar view tabs', () => {
    renderWithProviders(<CalendarNavTabs />, { initialRoute: ROUTES.MONTH });
    expect(screen.getByText('Year View')).toBeInTheDocument();
    expect(screen.getByText('Month View')).toBeInTheDocument();
    expect(screen.getByText('Week View')).toBeInTheDocument();
    expect(screen.getByText('Day View')).toBeInTheDocument();
  });

  it('exposes getActiveView via ref matching the current route', () => {
    const ref = createRef<ICalendarNavTabsHandle>();
    renderWithProviders(<CalendarNavTabs ref={ref} />, { initialRoute: ROUTES.WEEK });
    expect(ref.current?.getActiveView()).toBe(ROUTES.WEEK);
  });

  it('does not activate the MONTH tab on the profile route', () => {
    const ref = createRef<ICalendarNavTabsHandle>();
    renderWithProviders(<CalendarNavTabs ref={ref} />, { initialRoute: ROUTES.PROFILE });
    expect(ref.current?.getActiveView()).not.toBe(ROUTES.MONTH);
  });

  it('navigates when a tab is clicked', async () => {
    const ref = createRef<ICalendarNavTabsHandle>();
    renderWithProviders(<CalendarNavTabs ref={ref} />, { initialRoute: ROUTES.MONTH });
    await userEvent.click(screen.getByText('Week View'));
    expect(ref.current?.getActiveView()).toBe(ROUTES.WEEK);
  });
});
