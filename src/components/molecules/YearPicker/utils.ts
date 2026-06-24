export const YEAR_GROUP_SIZE = 18;

export function getDecadeStart(year: number): number {
  return Math.floor(year / 10) * 10;
}

export function getYearGroupStart(year: number) {
  return Math.floor(year / YEAR_GROUP_SIZE) * YEAR_GROUP_SIZE;
}
