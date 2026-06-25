import type { EventFormData } from 'app/components/organisms/EventModal/const';
import type { IEvent } from 'app/store/slices/eventSlice';

export const DAY_MS = 86400000;

export function getEventId(event: IEvent): string {
  return event._id;
}

export function getEventStartMs(event: IEvent): number {
  return new Date(event.startDate).getTime();
}

export function getEventEndMs(event: IEvent): number {
  return new Date(event.endDate).getTime();
}

export function getEventAlert(event: IEvent): number {
  return event.alert ?? 0;
}

function getEventLabelId(event: IEvent): string {
  const { labelId } = event;
  if (!labelId) return '';
  return typeof labelId === 'string' ? labelId : labelId._id;
}

export function getEventLabelName(event: IEvent): string | undefined {
  return typeof event.labelId === 'object' ? event.labelId.name : undefined;
}

export function getEventLabelColor(event: IEvent): string | undefined {
  return typeof event.labelId === 'object' ? event.labelId.color : undefined;
}

export function getResolvedEventLabelColor(
  event: IEvent,
  labelColorMap: Record<string, string>,
  fallbackColor: string,
): string {
  return getEventLabelColor(event) ?? labelColorMap[getEventLabelId(event)] ?? fallbackColor;
}

export function withEventTime(event: IEvent, startMs: number, endMs: number): IEvent {
  return {
    ...event,
    labelId: getEventLabelId(event) || undefined,
    startDate: new Date(startMs).toISOString(),
    endDate: new Date(endMs).toISOString(),
  };
}

export function getEventFormData(event: IEvent): Partial<EventFormData> {
  const start = getEventStartMs(event);
  const end = getEventEndMs(event);

  return {
    id: event._id,
    name: event.title,
    startDate: new Date(Math.floor(start / DAY_MS) * DAY_MS),
    startTime: start % DAY_MS,
    endDate: new Date(Math.floor(end / DAY_MS) * DAY_MS),
    endTime: end % DAY_MS,
    alert: getEventAlert(event),
    label: getEventLabelId(event),
    labelName: getEventLabelName(event),
    labelColor: getEventLabelColor(event),
    notes: event.description ?? '',
  };
}
