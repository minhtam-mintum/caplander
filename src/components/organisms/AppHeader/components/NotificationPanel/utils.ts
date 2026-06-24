import type { IEvent } from 'app/store/slices/eventSlice';
import type { EventFormData } from 'app/components/organisms/EventModal';
import { getEventFormData } from 'app/utils/event';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent ?? div.innerText ?? '';
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = timestamp - now;

  if (Math.abs(diff) < 60000) return 'Starting now';
  if (diff > 0 && diff < 3600000) return `Starting in ${Math.round(diff / 60000)}m`;

  // Use UTC to match how the app stores event times (startDate at UTC midnight + startTime ms)
  const timeMs = timestamp % 86400000;
  const h = Math.floor(timeMs / 3600000);
  const m = Math.floor((timeMs % 3600000) / 60000);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  const timeStr = `${displayH}:${String(m).padStart(2, '0')} ${period}`;

  const eventDay = Math.floor(timestamp / 86400000);
  const todayDay = Math.floor(now / 86400000);

  if (eventDay === todayDay) return `Today at ${timeStr}`;
  if (eventDay === todayDay + 1) return `Tomorrow at ${timeStr}`;

  const dayDiff = eventDay - todayDay;
  const date = new Date(timestamp);
  if (dayDiff > 0 && dayDiff <= 7) return `${WEEKDAYS[date.getUTCDay()]} at ${timeStr}`;
  if (dayDiff > 7 && dayDiff <= 14) return `Next week at ${timeStr}`;

  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()} at ${timeStr}`;
}

export function toFormData(event: IEvent): Partial<EventFormData> {
  return getEventFormData(event);
}
