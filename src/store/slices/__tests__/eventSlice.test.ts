import reducer, { addEvent, updateEvent, removeEvent } from 'app/store/slices/eventSlice';
import type { IEvent } from 'app/store/slices/eventSlice';

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
const empty = { items: [], loading: false, fetchedYears: [] };

describe('eventSlice', () => {
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
});
