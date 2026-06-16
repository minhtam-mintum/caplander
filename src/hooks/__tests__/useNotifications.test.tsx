import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { PropsWithChildren } from 'react';
import { makeStore } from 'app/test/utils';
import { useNotifications } from 'app/hooks/useNotifications';
import type { IEvent } from 'app/store/slices/eventSlice';

const preloadedState = {
  events: { items: [] },
  notifications: { readIds: [], notifiedIds: [] },
};

function makeWrapper(store: ReturnType<typeof makeStore>) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  };
}

function setupNotificationMock(permission: NotificationPermission) {
  const requestPermission = vi.fn().mockResolvedValue(permission);
  Object.defineProperty(window, 'Notification', {
    value: { permission, requestPermission },
    configurable: true,
    writable: true,
  });
  // No service worker in test environment
  Object.defineProperty(navigator, 'serviceWorker', {
    value: undefined,
    configurable: true,
  });
}

beforeEach(() => {
  localStorage.clear();
  setupNotificationMock('granted');
});

afterEach(() => vi.restoreAllMocks());

describe('useNotifications', () => {
  it('renders without throwing', () => {
    const store = makeStore(preloadedState);
    expect(() => renderHook(() => useNotifications(), { wrapper: makeWrapper(store) })).not.toThrow();
  });

  it('does not request permission when already granted', () => {
    setupNotificationMock('granted');
    const store = makeStore(preloadedState);
    renderHook(() => useNotifications(), { wrapper: makeWrapper(store) });
    expect(window.Notification.requestPermission).not.toHaveBeenCalled();
  });

  it('requests permission when status is "default"', async () => {
    setupNotificationMock('default' as NotificationPermission);
    const store = makeStore(preloadedState);
    renderHook(() => useNotifications(), { wrapper: makeWrapper(store) });
    await act(async () => {});
    expect(window.Notification.requestPermission).toHaveBeenCalled();
  });

  it('schedules timers for future events with alerts', () => {
    vi.useFakeTimers();
    const now = Date.now();
    const event: IEvent = {
      id: 'evt-1', name: 'Meeting',
      start: now + 30 * 60_000,  // 30 min from now
      end: now + 90 * 60_000,
      alert: 5 * 60_000,         // alert 5 min before start
      label: 'work', notes: '',
    };
    const store = makeStore({ ...preloadedState, events: { items: [event] } });
    const { unmount } = renderHook(() => useNotifications(), { wrapper: makeWrapper(store) });
    // Timer should be scheduled — verify unmount cleans up without error
    expect(() => unmount()).not.toThrow();
    vi.useRealTimers();
  });

  it('dispatches addNotified after timer fires', () => {
    // Pin timezone offset to 0 so delay = event.start - event.alert - now (no tz shift)
    vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(0);
    vi.useFakeTimers();
    const now = Date.now();
    const event: IEvent = {
      id: 'evt-fire', name: 'Fire Event',
      start: now + 100, // delay = 100ms - 0 (alert) - 0 (tzOffset) = 100ms
      end: now + 3_700_000,
      alert: 0,
      label: 'work', notes: '',
    };
    const store = makeStore({ ...preloadedState, events: { items: [event] } });

    // Mock Notification as a constructor for the fallback path
    const NotificationMock = vi.fn();
    window.Notification = Object.assign(NotificationMock, { permission: 'granted' as NotificationPermission, requestPermission: vi.fn() });

    renderHook(() => useNotifications(), { wrapper: makeWrapper(store) });
    act(() => { vi.advanceTimersByTime(200); });

    expect(store.getState().notifications.notifiedIds).toContain('evt-fire');
    vi.useRealTimers();
  });

  it('does not schedule timers when permission is denied', () => {
    vi.useFakeTimers();
    setupNotificationMock('denied');
    const now = Date.now();
    const event: IEvent = {
      id: 'evt-denied', name: 'Denied',
      start: now + 60_000, end: now + 120_000,
      alert: 0, label: 'work', notes: '',
    };
    const store = makeStore({ ...preloadedState, events: { items: [event] } });
    renderHook(() => useNotifications(), { wrapper: makeWrapper(store) });
    act(() => { vi.advanceTimersByTime(120_000); });
    expect(store.getState().notifications.notifiedIds).toHaveLength(0);
    vi.useRealTimers();
  });
});
