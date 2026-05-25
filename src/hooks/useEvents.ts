import { useCallback, useState } from 'react';

const STORAGE_KEY = 'app_events';

export interface IEvent {
  id: string;
  name: string;
  start: number;
  end: number;
  alert: number;
  label: string;
  notes: string;
}

function loadEvents(): IEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as IEvent[];
  } catch {
    // ignore parse errors
  }
  return [];
}

export function useEvents() {
  const [events, setEvents] = useState<IEvent[]>(loadEvents);

  const addEvent = useCallback((event: IEvent) => {
    setEvents((prev) => {
      const next = [...prev, event];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { events, addEvent };
}
