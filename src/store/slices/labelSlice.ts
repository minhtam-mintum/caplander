import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  apiGetLabels,
  apiCreateLabel,
  apiUpdateLabel,
  apiDeleteLabel,
} from 'app/services/api';
import { setAuth, logout, setAnonymous } from './authSlice';

export interface ILabel {
  _id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ILabelInput {
  color: string;
  name: string;
}

interface ILabelState {
  items: ILabel[];
  loading: boolean;
  fetched: boolean;
}

type AuthSliceState = { user: { _id: string } | null; isAnonymous: boolean };

interface ILegacyLabel extends ILabelInput {
  _id?: string;
  value?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

function createLocalLabel(label: ILabelInput, id: string = crypto.randomUUID()): ILabel {
  const now = new Date().toISOString();
  return {
    _id: id,
    userId: '',
    name: label.name,
    color: label.color,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  };
}

function normalizeLabel(label: ILegacyLabel): ILabel {
  return {
    _id: label._id ?? label.value ?? crypto.randomUUID(),
    userId: label.userId ?? '',
    name: label.name,
    color: label.color,
    createdAt: label.createdAt ?? new Date().toISOString(),
    updatedAt: label.updatedAt ?? label.createdAt ?? new Date().toISOString(),
    __v: label.__v ?? 0,
  };
}

export const fetchLabelsThunk = createAsyncThunk<
  ILabel[],
  void,
  { state: { auth: AuthSliceState; labels: ILabelState } }
>(
  'labels/fetch',
  async () => {
    return apiGetLabels();
  },
  {
    condition: (_, { getState }) => {
      const { auth, labels } = getState();
      if (!auth.user || auth.isAnonymous) return false;
      return !labels.fetched && !labels.loading;
    },
  },
);

export const addLabelThunk = createAsyncThunk<
  ILabel,
  ILabelInput,
  { state: { auth: AuthSliceState } }
>('labels/add', async (label, { getState }) => {
  const { auth } = getState();
  if (!auth.user || auth.isAnonymous) return createLocalLabel(label);
  return apiCreateLabel({ name: label.name, color: label.color });
});

export const updateLabelThunk = createAsyncThunk<
  ILabel,
  { id: string; name: string; color: string },
  { state: { auth: AuthSliceState; labels: ILabelState } }
>('labels/update', async ({ id, name, color }, { getState }) => {
  const { auth, labels } = getState();
  if (!auth.user || auth.isAnonymous) {
    const existing = labels.items.find((label) => label._id === id);
    return {
      ...(existing ?? createLocalLabel({ name, color }, id)),
      name,
      color,
      updatedAt: new Date().toISOString(),
    };
  }
  return apiUpdateLabel(id, { name, color });
});

export const deleteLabelThunk = createAsyncThunk<
  string,
  string,
  { state: { auth: AuthSliceState } }
>('labels/delete', async (id, { getState }) => {
  const { auth } = getState();
  if (!auth.user || auth.isAnonymous) return id;
  await apiDeleteLabel(id);
  return id;
});

const initialState: ILabelState = {
  items: [],
  loading: false,
  fetched: false,
};

const labelSlice = createSlice({
  name: 'labels',
  initialState,
  reducers: {
    setLabels: (state, action: PayloadAction<ILabel[]>) => {
      state.items = action.payload.map(normalizeLabel);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setAuth, (state) => {
        state.items = [];
        state.fetched = false;
        state.loading = false;
      })
      .addCase(logout, (state) => {
        state.items = [];
        state.fetched = false;
        state.loading = false;
      })
      .addCase(setAnonymous, (state) => {
        state.items = [];
        state.fetched = false;
        state.loading = false;
      })
      .addCase(fetchLabelsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLabelsThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.fetched = true;
        state.loading = false;
      })
      .addCase(fetchLabelsThunk.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addLabelThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateLabelThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((l) => l._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteLabelThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((l) => l._id !== action.payload);
      });
  },
});

export const { setLabels } = labelSlice.actions;
export default labelSlice.reducer;
