import { createAsyncThunk, createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import type { IApiEvent } from 'app/services/api';
import { apiCreateEvent, apiUpdateEvent, apiGetEvents } from 'app/services/api';

import { setAuth, logout, setAnonymous } from './authSlice';

export interface IEvent extends IApiEvent {}

interface IEventState {
  items: IEvent[];
  loading: boolean;
  fetchedYears: number[];
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

type AuthSliceState = { user: { _id: string } | null; isAnonymous: boolean };

interface IFetchEventsResult {
  events: IEvent[];
  year: number;
}

export const fetchEventsThunk = createAsyncThunk<
  IFetchEventsResult,
  { from: string; to: string },
  { state: { auth: AuthSliceState; events: IEventState } }
>(
  'events/fetch',
  async (params) => {
    const year = parseInt(params.from.slice(0, 4), 10);
    const events = await apiGetEvents(params);
    return { events, year };
  },
  {
    condition: (params, { getState }) => {
      const { auth, events } = getState();
      if (!auth.user || auth.isAnonymous) return false;
      const year = parseInt(params.from.slice(0, 4), 10);
      return !events.fetchedYears.includes(year);
    },
  },
);

export const createEventThunk = createAsyncThunk<
  IEvent,
  Omit<IEvent, '_id'>,
  { state: { auth: AuthSliceState } }
>('events/create', async (data, { getState }) => {
  const { auth } = getState();
  if (!auth.user || auth.isAnonymous) {
    return { _id: crypto.randomUUID(), ...data };
  }
  const apiEvent = await apiCreateEvent(data);
  return { ...apiEvent, alert: data.alert };
});

export const updateEventThunk = createAsyncThunk<
  IEvent,
  IEvent,
  { state: { auth: AuthSliceState } }
>('events/update', async (data, { getState }) => {
  const { auth } = getState();
  if (!auth.user || auth.isAnonymous) {
    return data;
  }
  const apiEvent = await apiUpdateEvent(data._id, data);
  return { ...apiEvent, alert: data.alert };
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState: IEventState = {
  items: [],
  loading: false,
  fetchedYears: [],
};

const clearOldSession = (state: IEventState) => {
  state.items = [];
  state.fetchedYears = [];
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<IEvent[]>) => {
      state.items = action.payload;
    },
    addEvent: (state, action: PayloadAction<IEvent>) => {
      state.items.push(action.payload);
    },
    updateEvent: (state, action: PayloadAction<IEvent>) => {
      const index = state.items.findIndex((e) => e._id === action.payload._id);
      if (index !== -1) state.items[index] = action.payload;
    },
    removeEvent: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((e) => e._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEventsThunk.fulfilled, (state, action) => {
        const { events, year } = action.payload;
        state.items = [
          ...state.items.filter((e) => new Date(e.startDate).getFullYear() !== year),
          ...events,
        ];
        state.fetchedYears.push(year);
        state.loading = false;
      })
      .addCase(fetchEventsThunk.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createEventThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateEventThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addMatcher(isAnyOf(setAuth, logout, setAnonymous), clearOldSession);
  },
});

export const { setEvents, addEvent, updateEvent, removeEvent } = eventSlice.actions;
export default eventSlice.reducer;
