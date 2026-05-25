export function parseTime(ms: number): { h: string; m: string } {
  const totalMinutes = Math.floor(ms / 60000);
  return {
    h: String(Math.floor(totalMinutes / 60)).padStart(2, '0'),
    m: String(totalMinutes % 60).padStart(2, '0'),
  };
}
