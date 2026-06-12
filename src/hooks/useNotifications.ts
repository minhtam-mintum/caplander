import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/store';
import { addNotified } from 'app/store/slices/notificationSlice';
import { formatTime } from 'app/utils/calendar';

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
    // event.start is stored as UTC-midnight + raw time-ms (the "wall clock" time the user
    // entered). Shift by the local timezone offset so the timer fires at that local wall time.
    const tzOffsetMs = new Date().getTimezoneOffset() * 60000;
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const event of events) {
      const snapshot = { ...event };

      // Advance-alert timer (fires event.alert ms before start, skipped when alert is 0)
      if (event.alert > 0) {
        const alertDelay = event.start - event.alert - now + tzOffsetMs;
        if (alertDelay >= 0) {
          timers.push(
            setTimeout(() => {
              const body = `Starting at ${formatTime(snapshot.start % 86400000)}`;
              showNotification(snapshot.name, { body, icon: '/favicon.ico', tag: `${snapshot.id}-alert` });
            }, alertDelay),
          );
        }
      }

      // Start-time timer — fires the moment the event begins
      const startDelay = event.start - now + tzOffsetMs;
      if (startDelay >= 0) {
        timers.push(
          setTimeout(() => {
            showNotification(`${snapshot.name} has started`, {
              body: `Started at ${formatTime(snapshot.start % 86400000)}`,
              icon: '/favicon.ico',
              tag: `${snapshot.id}-started`,
            });
            dispatch(addNotified(snapshot.id));
          }, startDelay),
        );
      }
    }

    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [events, permission]);
}
