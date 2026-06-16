import reducer, { addEvent, updateEvent, removeEvent } from 'app/store/slices/eventSlice';
import type { IEvent } from 'app/store/slices/eventSlice';

const ev1: IEvent = { id: '1', name: 'Meeting', start: 1000, end: 2000, alert: 0, label: 'work', notes: '' };
const ev2: IEvent = { id: '2', name: 'Lunch', start: 3000, end: 4000, alert: 0, label: 'personal', notes: '' };
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
      expect(state.items[1].id).toBe('2');
    });
  });

  describe('updateEvent', () => {
    it('replaces the event with matching id', () => {
      const s1 = reducer(empty, addEvent(ev1));
      const updated = { ...ev1, name: 'Stand-up' };
      const s2 = reducer(s1, updateEvent(updated));
      expect(s2.items[0].name).toBe('Stand-up');
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
      expect(s2.items[0].id).toBe('2');
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
