import { renderHook, act, waitFor } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { useLabels } from 'app/hooks/useLabels';
import { makeStore } from 'app/test/utils';
import * as api from 'app/services/api';

vi.mock('app/services/api', async (importOriginal) => {
  const original = await importOriginal<typeof import('app/services/api')>();
  return {
    ...original,
    apiGetLabels: vi.fn(),
    apiCreateLabel: vi.fn(),
  };
});

function makeWrapper(store: ReturnType<typeof makeStore>) {
  return function Wrapper({ children }: PropsWithChildren) {
    return createElement(Provider, { store, children });
  };
}

const authUser = {
  user: { _id: 'u1', userId: 'testuser', name: 'Test User' },
  accessToken: 'tok',
  refreshToken: 'ref',
  isAnonymous: false,
};

function makeApiLabel(overrides: Partial<api.IApiLabel>): api.IApiLabel {
  return {
    _id: 'id1',
    userId: 'u1',
    name: 'Work',
    color: '#FF5733',
    createdAt: '2026-06-11T06:23:44.486Z',
    updatedAt: '2026-06-11T06:23:44.486Z',
    __v: 0,
    ...overrides,
  };
}

describe('useLabels', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty labels for unauthenticated user', () => {
    const store = makeStore();
    const { result } = renderHook(() => useLabels(), { wrapper: makeWrapper(store) });
    expect(result.current.labels).toEqual([]);
    expect(api.apiGetLabels).not.toHaveBeenCalled();
  });

  it('fetches labels from API for authenticated user', async () => {
    vi.mocked(api.apiGetLabels).mockResolvedValue([
      makeApiLabel({ _id: 'id1', name: 'Work', color: '#FF5733' }),
      makeApiLabel({ _id: 'id2', name: 'Personal', color: '#33FF57' }),
    ]);
    const store = makeStore({ auth: authUser } as never);
    const { result } = renderHook(() => useLabels(), { wrapper: makeWrapper(store) });

    await waitFor(() => expect(result.current.labels).toHaveLength(2));
    expect(result.current.labels[0]).toEqual(
      makeApiLabel({ _id: 'id1', name: 'Work', color: '#FF5733' }),
    );
    expect(result.current.labels[1]).toEqual(
      makeApiLabel({ _id: 'id2', name: 'Personal', color: '#33FF57' }),
    );
  });

  it('returns empty labels when API fails', async () => {
    vi.mocked(api.apiGetLabels).mockRejectedValue(new Error('Network error'));
    const store = makeStore({ auth: authUser } as never);
    const { result } = renderHook(() => useLabels(), { wrapper: makeWrapper(store) });

    await waitFor(() => expect(api.apiGetLabels).toHaveBeenCalled());
    expect(result.current.labels).toEqual([]);
  });

  it('addLabel for anonymous user adds to local state', async () => {
    const generatedId = '00000000-0000-4000-8000-000000000000';
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(generatedId);
    const store = makeStore();
    const { result } = renderHook(() => useLabels(), { wrapper: makeWrapper(store) });

    const newLabel = { name: 'Test', color: '#abc' };
    let returned: Awaited<ReturnType<typeof result.current.addLabel>> | undefined;
    await act(async () => {
      returned = await result.current.addLabel(newLabel);
    });

    expect(crypto.randomUUID).toHaveBeenCalled();
    expect(result.current.labels).toContainEqual(
      expect.objectContaining({ ...newLabel, _id: generatedId }),
    );
    expect(returned).toEqual(expect.objectContaining({ ...newLabel, _id: generatedId }));
    expect(api.apiCreateLabel).not.toHaveBeenCalled();
  });

  it('addLabel for authenticated user calls API and uses returned id', async () => {
    vi.mocked(api.apiGetLabels).mockResolvedValue([]);
    vi.mocked(api.apiCreateLabel).mockResolvedValue(makeApiLabel({
      _id: 'server-id',
      name: 'Test',
      color: '#abc',
    }));
    const store = makeStore({ auth: authUser } as never);
    const { result } = renderHook(() => useLabels(), { wrapper: makeWrapper(store) });
    await waitFor(() => expect(api.apiGetLabels).toHaveBeenCalled());

    let returned: Awaited<ReturnType<typeof result.current.addLabel>> | undefined;
    await act(async () => {
      returned = await result.current.addLabel({ name: 'Test', color: '#abc' });
    });

    expect(api.apiCreateLabel).toHaveBeenCalledWith({ name: 'Test', color: '#abc' });
    expect(result.current.labels).toContainEqual(
      makeApiLabel({ _id: 'server-id', name: 'Test', color: '#abc' }),
    );
    expect(returned).toEqual(makeApiLabel({ _id: 'server-id', name: 'Test', color: '#abc' }));
  });

  it('addLabel preserves existing labels', async () => {
    vi.mocked(api.apiGetLabels).mockResolvedValue([
      makeApiLabel({ _id: 'id1', name: 'Work', color: '#FF5733' }),
    ]);
    vi.mocked(api.apiCreateLabel).mockResolvedValue(makeApiLabel({
      _id: 'id2',
      name: 'New',
      color: '#fff',
    }));
    const store = makeStore({ auth: authUser } as never);
    const { result } = renderHook(() => useLabels(), { wrapper: makeWrapper(store) });
    await waitFor(() => expect(result.current.labels).toHaveLength(1));

    await act(async () => {
      await result.current.addLabel({ name: 'New', color: '#fff' });
    });

    expect(result.current.labels[0]).toEqual(
      makeApiLabel({ _id: 'id1', name: 'Work', color: '#FF5733' }),
    );
    expect(result.current.labels).toHaveLength(2);
  });
});
