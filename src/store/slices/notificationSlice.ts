import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const NOTIFICATION_READ_KEY = 'app_notification_read';

function loadReadIds(): string[] {
  try {
    const stored = localStorage.getItem(NOTIFICATION_READ_KEY);
    if (stored) return JSON.parse(stored) as string[];
  } catch {}
  return [];
}

export { NOTIFICATION_READ_KEY };

interface INotificationState {
  readIds: string[];
  notifiedIds: string[];
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { readIds: loadReadIds(), notifiedIds: [] } as INotificationState,
  reducers: {
    addNotified: (state, action: PayloadAction<string>) => {
      if (!state.notifiedIds.includes(action.payload)) {
        state.notifiedIds.push(action.payload);
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      if (!state.readIds.includes(action.payload)) {
        state.readIds.push(action.payload);
      }
    },
    markAllAsRead: (state, action: PayloadAction<string[]>) => {
      for (const id of action.payload) {
        if (!state.readIds.includes(id)) state.readIds.push(id);
      }
    },
  },
});

export const { addNotified, markAsRead, markAllAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
