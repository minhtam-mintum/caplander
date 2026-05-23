export function parseTime(value: string): { h: string; m: string } {
  const [h = '00', m = '00'] = value?.split(':') ?? [];
  return { h: h.padStart(2, '0'), m: m.padStart(2, '0') };
}
