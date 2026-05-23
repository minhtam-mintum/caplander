import { useCallback, useState } from 'react';

const STORAGE_KEY = 'app_labels';

export interface ILabel {
  color: string;
  name: string;
  value: string;
}

const DEFAULT_LABELS: ILabel[] = [
  { name: 'Work', value: 'work', color: '#3b82f6' },
  { name: 'Personal', value: 'personal', color: '#22c55e' },
  { name: 'Health', value: 'health', color: '#ef4444' },
  { name: 'Learning', value: 'learning', color: '#8b5cf6' },
  { name: 'Other', value: 'other', color: '#f97316' },
];

function loadLabels(): ILabel[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as ILabel[];
  } catch {
    // ignore parse errors
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LABELS));
  return DEFAULT_LABELS;
}

export function useLabels() {
  const [labels, setLabels] = useState<ILabel[]>(loadLabels);

  const addLabel = useCallback((label: ILabel) => {
    setLabels((prev) => {
      const next = [...prev, label];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { labels, addLabel };
}
