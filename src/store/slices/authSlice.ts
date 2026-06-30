import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { clearTokens, initTokens, type IUser } from 'app/services/api';

export const AUTH_STORAGE_KEY = 'app_auth';

interface IAuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAnonymous: boolean;
  sessionExpired: boolean;
}

interface ISetAuthPayload {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

function loadAuth(): IAuthState {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) {
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAnonymous: false,
        sessionExpired: false,
      };
    }
    const parsed = JSON.parse(stored) as IAuthState;
    if (parsed.isAnonymous) {
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAnonymous: true,
        sessionExpired: false,
      };
    }
    if (parsed.user && parsed.accessToken && parsed.refreshToken) {
      initTokens(parsed.accessToken, parsed.refreshToken);
      return { ...parsed, sessionExpired: false };
    }
  } catch {}
  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAnonymous: false,
    sessionExpired: false,
  };
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadAuth(),
  reducers: {
    setAuth: (state, action: PayloadAction<ISetAuthPayload>) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAnonymous = false;
      state.sessionExpired = false;
    },
    setAnonymous: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAnonymous = true;
      state.sessionExpired = false;
      clearTokens();
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAnonymous = false;
      state.sessionExpired = false;
      clearTokens();
    },
    expireSession: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAnonymous = false;
      state.sessionExpired = true;
      clearTokens();
    },
    updateUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },
    updateTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.sessionExpired = false;
    },
  },
});

export const { setAuth, setAnonymous, logout, expireSession, updateTokens, updateUser } =
  authSlice.actions;
export default authSlice.reducer;
