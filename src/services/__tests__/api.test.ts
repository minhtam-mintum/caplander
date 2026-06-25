import {
  apiGetMe,
  clearTokens,
  initTokens,
  setOnSessionExpired,
  type IUser,
} from 'app/services/api';

function jsonResponse<T>(body: T, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('api token refresh', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    clearTokens();
    setOnSessionExpired(null);
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('expires the session and clears tokens when refresh token returns 401', async () => {
    const onSessionExpired = vi.fn();
    initTokens('expired-access', 'bad-refresh');
    setOnSessionExpired(onSessionExpired);

    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({ message: 'Refresh token expired' }, { status: 401 }))
      .mockResolvedValueOnce(
        jsonResponse<IUser>(
          { _id: 'u1', userId: 'testuser', name: 'Test User' },
          { status: 200 },
        ),
      );

    await expect(apiGetMe()).rejects.toThrow('Session expired. Please log in again.');

    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/auth/refresh'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer bad-refresh' }),
      }),
    );

    await expect(apiGetMe()).resolves.toEqual({
      _id: 'u1',
      userId: 'testuser',
      name: 'Test User',
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('/users/me'),
      expect.objectContaining({
        headers: expect.not.objectContaining({ Authorization: expect.any(String) }),
      }),
    );
  });
});
