import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PropsWithChildren } from 'react';
import { useSeekDate } from 'app/hooks/useSeekDate';

function makeWrapper(seekDate?: number) {
  return function Wrapper({ children }: PropsWithChildren) {
    const entry = seekDate != null
      ? { pathname: '/', state: { seekDate } }
      : { pathname: '/' };
    return <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>;
  };
}

describe('useSeekDate', () => {
  it('calls onSeek with a Date when location.state.seekDate is set', () => {
    const onSeek = vi.fn();
    const ts = new Date(2024, 2, 15).getTime();
    renderHook(() => useSeekDate(onSeek), { wrapper: makeWrapper(ts) });
    expect(onSeek).toHaveBeenCalledOnce();
    expect(onSeek).toHaveBeenCalledWith(expect.any(Date));
  });

  it('passes the correct date to onSeek', () => {
    const onSeek = vi.fn();
    const ts = new Date(2024, 5, 10).getTime();
    renderHook(() => useSeekDate(onSeek), { wrapper: makeWrapper(ts) });
    const received: Date = onSeek.mock.calls[0][0];
    expect(received.getTime()).toBe(ts);
  });

  it('does not call onSeek when seekDate is absent from state', () => {
    const onSeek = vi.fn();
    renderHook(() => useSeekDate(onSeek), { wrapper: makeWrapper() });
    expect(onSeek).not.toHaveBeenCalled();
  });
});
