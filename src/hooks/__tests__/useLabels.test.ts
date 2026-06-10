import { renderHook, act } from '@testing-library/react';
import { useLabels, type ILabel } from 'app/hooks/useLabels';

const STORAGE_KEY = 'app_labels';

beforeEach(() => localStorage.clear());

describe('useLabels', () => {
  it('returns the 5 default labels when localStorage is empty', () => {
    const { result } = renderHook(() => useLabels());
    expect(result.current.labels).toHaveLength(5);
    expect(result.current.labels.map((l) => l.value)).toEqual([
      'work', 'personal', 'health', 'learning', 'other',
    ]);
  });

  it('persists defaults to localStorage on first load', () => {
    renderHook(() => useLabels());
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).toHaveLength(5);
  });

  it('loads previously saved labels from localStorage', () => {
    const saved: ILabel[] = [{ name: 'Custom', value: 'custom', color: '#000' }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    const { result } = renderHook(() => useLabels());
    expect(result.current.labels).toHaveLength(1);
    expect(result.current.labels[0].value).toBe('custom');
  });

  it('addLabel appends the new label to the list', () => {
    const { result } = renderHook(() => useLabels());
    const newLabel: ILabel = { name: 'Test', value: 'test', color: '#abc' };
    act(() => result.current.addLabel(newLabel));
    expect(result.current.labels).toContainEqual(newLabel);
    expect(result.current.labels).toHaveLength(6);
  });

  it('addLabel persists the updated list to localStorage', () => {
    const { result } = renderHook(() => useLabels());
    const newLabel: ILabel = { name: 'Test', value: 'test', color: '#abc' };
    act(() => result.current.addLabel(newLabel));
    const stored: ILabel[] = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).toContainEqual(newLabel);
  });

  it('addLabel preserves existing labels', () => {
    const { result } = renderHook(() => useLabels());
    const initial = result.current.labels[0];
    act(() => result.current.addLabel({ name: 'New', value: 'new', color: '#fff' }));
    expect(result.current.labels[0]).toEqual(initial);
  });
});
