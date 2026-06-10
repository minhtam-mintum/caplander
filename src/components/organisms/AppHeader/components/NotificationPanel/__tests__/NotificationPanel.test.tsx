import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationPanel } from '../index';
import { renderWithProviders } from 'app/test/utils';
import type { IEvent } from 'app/store/slices/eventSlice';

const EVENT: IEvent = {
  id: 'evt-1',
  name: 'Stand-up',
  start: Date.now() + 3600000, // 1 hour from now
  end: Date.now() + 7200000,
  alert: 900000,
  label: 'work',
  notes: '',
};

const storeWithNotification = {
  events: { items: [EVENT] },
  notifications: { readIds: [], notifiedIds: [EVENT.id] },
};

const storeRead = {
  events: { items: [EVENT] },
  notifications: { readIds: [EVENT.id], notifiedIds: [EVENT.id] },
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
      expect.objectContaining({ id: EVENT.id, name: EVENT.name }),
    );
  });

  it('dispatches markAsRead and closes the panel when an item is clicked', async () => {
    const { store } = renderWithProviders(<NotificationPanel onEventClick={vi.fn()} />, {
      preloadedState: storeWithNotification,
    });
    await userEvent.click(screen.getByRole('button', { name: /notifications/i }));
    await userEvent.click(screen.getByText('Stand-up'));

    expect(store.getState().notifications.readIds).toContain(EVENT.id);
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('dispatches markAllAsRead when "Mark all as read" is clicked', async () => {
    const { store } = renderWithProviders(<NotificationPanel onEventClick={vi.fn()} />, {
      preloadedState: storeWithNotification,
    });
    await userEvent.click(screen.getByRole('button', { name: /notifications/i }));

    const panel = screen.getByText('Notifications').closest('div')!;
    await userEvent.click(within(panel).getByText('Mark all as read'));

    expect(store.getState().notifications.readIds).toContain(EVENT.id);
  });
});
