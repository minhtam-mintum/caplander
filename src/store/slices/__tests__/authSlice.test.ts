import authReducer, { expireSession, setAuth } from 'app/store/slices/authSlice';

describe('authSlice', () => {
  it('clears stored authentication and marks an expired session', () => {
    const authenticatedState = authReducer(
      undefined,
      setAuth({
        user: { _id: 'u1', userId: 'testuser', name: 'Test User' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
    );

    expect(authReducer(authenticatedState, expireSession())).toEqual({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAnonymous: false,
      sessionExpired: true,
    });
  });
});
