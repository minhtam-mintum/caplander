import { configureStore, type ThunkDispatch, type UnknownAction } from '@reduxjs/toolkit';
import reducer, {
  addEvent,
  fetchEventsThunk,
  updateEvent,
  removeEvent,
} from 'app/store/slices/eventSlice';
import type { IEvent } from 'app/store/slices/eventSlice';
import * as api from 'app/services/api';

vi.mock('app/services/api', async (importOriginal) => {
  const original = await importOriginal<typeof import('app/services/api')>();
  return {
    ...original,
    apiGetEvents: vi.fn(),
  };
});

const ev1: IEvent = {
  _id: '1',
  title: 'Meeting',
  startDate: new Date(1000).toISOString(),
  endDate: new Date(2000).toISOString(),
  allDay: false,
  alert: 0,
  labelId: 'work',
  description: '',
};
const ev2: IEvent = {
  _id: '2',
  title: 'Lunch',
  startDate: new Date(3000).toISOString(),
  endDate: new Date(4000).toISOString(),
  allDay: false,
  alert: 0,
  labelId: 'personal',
  description: '',
};
const empty = { items: [], loading: false, fetchedYears: [], fetchingYears: [] };

const authUser = {
  user: { _id: 'u1' },
  isAnonymous: false,
};

const authReducer = (state: typeof authUser = authUser) => state;

describe('eventSlice', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('addEvent', () => {
    it('appends the event to items', () => {
      const state = reducer(empty, addEvent(ev1));
      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(ev1);
    });

    it('appends multiple events in order', () => {
      const state = reducer(reducer(empty, addEvent(ev1)), addEvent(ev2));
      expect(state.items).toHaveLength(2);
      expect(state.items[1]._id).toBe('2');
    });
  });

  describe('updateEvent', () => {
    it('replaces the event with matching id', () => {
      const s1 = reducer(empty, addEvent(ev1));
      const updated = { ...ev1, title: 'Stand-up' };
      const s2 = reducer(s1, updateEvent(updated));
      expect(s2.items[0].title).toBe('Stand-up');
      expect(s2.items).toHaveLength(1);
    });

    it('is a no-op when id is not found', () => {
      const s1 = reducer(empty, addEvent(ev1));
      const s2 = reducer(s1, updateEvent(ev2));
      expect(s2.items).toHaveLength(1);
      expect(s2.items[0]).toEqual(ev1);
    });
  });

  describe('removeEvent', () => {
    it('removes the event with matching id', () => {
      const s1 = reducer(reducer(empty, addEvent(ev1)), addEvent(ev2));
      const s2 = reducer(s1, removeEvent('1'));
      expect(s2.items).toHaveLength(1);
      expect(s2.items[0]._id).toBe('2');
    });

    it('is a no-op when id is not found', () => {
      const s1 = reducer(empty, addEvent(ev1));
      const s2 = reducer(s1, removeEvent('nonexistent'));
      expect(s2.items).toHaveLength(1);
    });

    it('can remove all events', () => {
      const s1 = reducer(reducer(empty, addEvent(ev1)), addEvent(ev2));
      const s2 = reducer(reducer(s1, removeEvent('1')), removeEvent('2'));
      expect(s2.items).toHaveLength(0);
    });
  });

  describe('fetchEventsThunk', () => {
    it('skips duplicate requests while the same year is already fetching', async () => {
      let resolveEvents: (events: IEvent[]) => void = () => {};
      vi.mocked(api.apiGetEvents).mockReturnValue(
        new Promise((resolve) => {
          resolveEvents = resolve;
        }),
      );
      const store = configureStore({
        reducer: {
          events: reducer,
          auth: authReducer,
        },
      });
      const dispatch = store.dispatch as ThunkDispatch<
        ReturnType<typeof store.getState>,
        unknown,
        UnknownAction
      >;
      const params = { from: '2026-01-01', to: '2026-12-31' };

      const first = dispatch(fetchEventsThunk(params));
      const second = dispatch(fetchEventsThunk(params));

      expect(api.apiGetEvents).toHaveBeenCalledTimes(1);
      expect(store.getState().events.fetchingYears).toEqual([2026]);
      expect(store.getState().events.loading).toBe(true);

      resolveEvents([ev1]);
      await first;
      await second;

      expect(store.getState().events.fetchedYears).toEqual([2026]);
      expect(store.getState().events.fetchingYears).toEqual([]);
      expect(store.getState().events.loading).toBe(false);
    });
  });
});
