import { configureStore, type Middleware } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import eventReducer, { removeEvent, setEvents } from './slices/eventSlice';
import notificationReducer, { NOTIFICATION_READ_KEY } from './slices/notificationSlice';
import authReducer, { AUTH_STORAGE_KEY, expireSession, updateTokens } from './slices/authSlice';
import labelReducer, { setLabels } from './slices/labelSlice';
import { apiDeleteEvent, setOnSessionExpired, setOnTokensRefreshed } from 'app/services/api';

export const ANON_EVENTS_KEY = 'anon_events';
export const ANON_LABELS_KEY = 'anon_labels';

type SyncState = {
  auth: { user: { _id: string } | null; isAnonymous: boolean };
};

const apiSyncMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  const result = next(action);
  const state = storeAPI.getState() as SyncState;

  if (!state.auth.user || state.auth.isAnonymous) return result;

  if (removeEvent.match(action)) {
    apiDeleteEvent(action.payload as string).catch(console.error);
  }

  return result;
};

export const store = configureStore({
  reducer: {
    events: eventReducer,
    notifications: notificationReducer,
    auth: authReducer,
    labels: labelReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSyncMiddleware),
});

// Hydrate anonymous data from localStorage on startup
try {
  const authRaw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (authRaw) {
    const auth = JSON.parse(authRaw) as { isAnonymous?: boolean };
    if (auth.isAnonymous) {
      const eventsRaw = localStorage.getItem(ANON_EVENTS_KEY);
      if (eventsRaw) store.dispatch(setEvents(JSON.parse(eventsRaw)));
      const labelsRaw = localStorage.getItem(ANON_LABELS_KEY);
      if (labelsRaw) store.dispatch(setLabels(JSON.parse(labelsRaw)));
    }
  }
} catch { /* ignore corrupt storage */ }

setOnTokensRefreshed(({ accessToken, refreshToken }) => {
  store.dispatch(updateTokens({ accessToken, refreshToken }));
});

setOnSessionExpired(() => {
  store.dispatch(expireSession());
});

store.subscribe(() => {
  const { notifications, auth, events, labels } = store.getState();
  localStorage.setItem(NOTIFICATION_READ_KEY, JSON.stringify(notifications.readIds));
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  if (auth.isAnonymous) {
    localStorage.setItem(ANON_EVENTS_KEY, JSON.stringify(events.items));
    localStorage.setItem(ANON_LABELS_KEY, JSON.stringify(labels.items));
  } else {
    localStorage.removeItem(ANON_EVENTS_KEY);
    localStorage.removeItem(ANON_LABELS_KEY);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
