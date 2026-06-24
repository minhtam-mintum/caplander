import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/store';
import { addNotified } from 'app/store/slices/notificationSlice';
import { formatTime } from 'app/utils/calendar';
import { getEventAlert, getEventId, getEventStartMs } from 'app/utils/event';

async function showNotification(title: string, options: NotificationOptions) {
  if ('serviceWorker' in navigator) {
    try {
      const swReady = Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('sw-timeout')), 2000)),
      ]);
      const reg = await swReady;
      await (reg as ServiceWorkerRegistration).showNotification(title, options);
      return;
    } catch {
      // fall through to basic Notification
    }
  }
  new Notification(title, options);
}

export function useNotifications() {
  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.events.items);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  );

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(setPermission);
    }
  }, []);

  useEffect(() => {
    if (permission !== 'granted') return;

    const now = Date.now();
    // event.startDate is stored as UTC-midnight + raw time-ms (the "wall clock" time the user
    // entered). Shift by the local timezone offset so the timer fires at that local wall time.
    const tzOffsetMs = new Date().getTimezoneOffset() * 60000;
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const event of events) {
      const snapshot = { ...event };
      const eventId = getEventId(event);
      const eventStart = getEventStartMs(event);
      const eventAlert = getEventAlert(event);

      // Advance-alert timer (fires event.alert ms before start, skipped when alert is 0)
      if (eventAlert > 0) {
        const alertDelay = eventStart - eventAlert - now + tzOffsetMs;
        if (alertDelay >= 0) {
          timers.push(
            setTimeout(() => {
              const snapshotStart = getEventStartMs(snapshot);
              const body = `Starting at ${formatTime(snapshotStart % 86400000)}`;
              showNotification(snapshot.title, { body, icon: '/favicon.ico', tag: `${eventId}-alert` });
            }, alertDelay),
          );
        }
      }

      // Start-time timer — fires the moment the event begins
      const startDelay = eventStart - now + tzOffsetMs;
      if (startDelay >= 0) {
        timers.push(
          setTimeout(() => {
            const snapshotStart = getEventStartMs(snapshot);
            showNotification(`${snapshot.title} has started`, {
              body: `Started at ${formatTime(snapshotStart % 86400000)}`,
              icon: '/favicon.ico',
              tag: `${eventId}-started`,
            });
            dispatch(addNotified(eventId));
          }, startDelay),
        );
      }
    }

    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [events, permission]);
}
