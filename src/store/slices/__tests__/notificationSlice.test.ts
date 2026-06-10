import reducer, { addNotified, markAsRead, markAllAsRead } from 'app/store/slices/notificationSlice';

const empty = { readIds: [], notifiedIds: [] };

describe('notificationSlice', () => {
  describe('addNotified', () => {
    it('adds a new id to notifiedIds', () => {
      const state = reducer(empty, addNotified('evt-1'));
      expect(state.notifiedIds).toContain('evt-1');
    });

    it('does not duplicate an existing id', () => {
      const s1 = reducer(empty, addNotified('evt-1'));
      const s2 = reducer(s1, addNotified('evt-1'));
      expect(s2.notifiedIds.filter((id) => id === 'evt-1')).toHaveLength(1);
    });

    it('does not affect readIds', () => {
      const state = reducer(empty, addNotified('evt-1'));
      expect(state.readIds).toHaveLength(0);
    });
  });

  describe('markAsRead', () => {
    it('adds a new id to readIds', () => {
      const state = reducer(empty, markAsRead('evt-1'));
      expect(state.readIds).toContain('evt-1');
    });

    it('does not duplicate an existing id', () => {
      const s1 = reducer(empty, markAsRead('evt-1'));
      const s2 = reducer(s1, markAsRead('evt-1'));
      expect(s2.readIds.filter((id) => id === 'evt-1')).toHaveLength(1);
    });

    it('does not affect notifiedIds', () => {
      const state = reducer(empty, markAsRead('evt-1'));
      expect(state.notifiedIds).toHaveLength(0);
    });
  });

  describe('markAllAsRead', () => {
    it('adds all ids from the payload', () => {
      const state = reducer(empty, markAllAsRead(['a', 'b', 'c']));
      expect(state.readIds).toEqual(['a', 'b', 'c']);
    });

    it('skips ids that are already read', () => {
      const s1 = reducer(empty, markAsRead('a'));
      const s2 = reducer(s1, markAllAsRead(['a', 'b']));
      expect(s2.readIds.filter((id) => id === 'a')).toHaveLength(1);
      expect(s2.readIds).toContain('b');
    });

    it('is a no-op for an empty payload', () => {
      const s1 = reducer(empty, markAsRead('a'));
      const s2 = reducer(s1, markAllAsRead([]));
      expect(s2.readIds).toEqual(['a']);
    });
  });
});
