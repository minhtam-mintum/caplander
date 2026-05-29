export const HOUR_HEIGHT = 64; // px per hour
export const START_HOUR = 0;
export const END_HOUR = 24;

export const WEEK_DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
export const TOTAL_HEIGHT = HOURS.length * HOUR_HEIGHT;
export const WEEK_START = 1 as const;
export const DEFAULT_COLOR = '#6366f1';
export const ALL_DAY_ROW_H = 24;
export const ALL_DAY_GAP = 2;
export const ALL_DAY_PAD = 6;
export const SNAP_MIN = 15;
