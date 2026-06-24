import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationPanel } from '../index';
import { renderWithProviders } from 'app/test/utils';
import type { IEvent } from 'app/store/slices/eventSlice';

const EVENT: IEvent = {
  _id: 'evt-1',
  title: 'Stand-up',
  startDate: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
  endDate: new Date(Date.now() + 7200000).toISOString(),
  allDay: false,
  alert: 900000,
  labelId: 'work',
  description: '',
};

const storeWithNotification = {
  events: { items: [EVENT] },
  notifications: { readIds: [], notifiedIds: [EVENT._id] },
};

const storeRead = {
  events: { items: [EVENT] },
  notifications: { readIds: [EVENT._id], notifiedIds: [EVENT._id] },
};

const storeEmpty = {
  events: { items: [] },
  notifications: { readIds: [], notifiedIds: [] },
};

describe('NotificationPanel', () => {
  it('renders the bell button', () => {
    renderWithProviders(<NotificationPanel onEventClick={vi.fn()} />, { preloadedState: storeEmpty });
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('shows an unread badge when there are unread notifications', () => {
    renderWithProviders(<NotificationPanel onEventClick={vi.fn()} />, {
      preloadedState: storeWithNotification,
    });
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('does not show the badge when all notifications are read', () => {
    renderWithProviders(<NotificationPanel onEventClick={vi.fn()} />, { preloadedState: storeRead });
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('opens the notification panel on bell click', async () => {
    renderWithProviders(<NotificationPanel onEventClick={vi.fn()} />, {
      preloadedState: storeWithNotification,
    });
    await userEvent.click(screen.getByRole('button', { name: /notifications/i }));
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Stand-up')).toBeInTheDocument();
  });

  it('shows "No events" when there are no notified events', async () => {
    renderWithProviders(<NotificationPanel onEventClick={vi.fn()} />, { preloadedState: storeEmpty });
    await userEvent.click(screen.getByRole('button', { name: /notifications/i }));
    expect(screen.getByText('No events')).toBeInTheDocument();
  });

  it('calls onEventClick with form data when an item is clicked', async () => {
    const onEventClick = vi.fn();
    renderWithProviders(<NotificationPanel onEventClick={onEventClick} />, {
      preloadedState: storeWithNotification,
    });
    await userEvent.click(screen.getByRole('button', { name: /notifications/i }));
    await userEvent.click(screen.getByText('Stand-up'));

    expect(onEventClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: EVENT._id, name: EVENT.title }),
    );
  });

  it('dispatches markAsRead and closes the panel when an item is clicked', async () => {
    const { store } = renderWithProviders(<NotificationPanel onEventClick={vi.fn()} />, {
      preloadedState: storeWithNotification,
    });
    await userEvent.click(screen.getByRole('button', { name: /notifications/i }));
    await userEvent.click(screen.getByText('Stand-up'));

    expect(store.getState().notifications.readIds).toContain(EVENT._id);
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('dispatches markAllAsRead when "Mark all as read" is clicked', async () => {
    const { store } = renderWithProviders(<NotificationPanel onEventClick={vi.fn()} />, {
      preloadedState: storeWithNotification,
    });
    await userEvent.click(screen.getByRole('button', { name: /notifications/i }));

    const panel = screen.getByText('Notifications').closest('div')!;
    await userEvent.click(within(panel).getByText('Mark all as read'));

    expect(store.getState().notifications.readIds).toContain(EVENT._id);
  });
});
