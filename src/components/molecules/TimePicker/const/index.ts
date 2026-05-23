export const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
export const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

export const ITEM_H = 36;  // h-9
export const LIST_H = 180; // max-h-45
export const SCROLL_PADDING = (LIST_H - ITEM_H) / 2;
