export function timeToOffset(time: string, startHour: number, hourHeight: number): number {
  const [h, m] = time.split(':').map(Number);
  return (h * 60 + m - startHour * 60) * (hourHeight / 60);
}

export function durationToHeight(start: string, end: string, hourHeight: number): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em - (sh * 60 + sm)) * (hourHeight / 60);
}

export function getCurrentTimeOffset(startHour: number, hourHeight: number): number {
  const now = new Date();
  return timeToOffset(
    `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
    startHour,
    hourHeight,
  );
}
