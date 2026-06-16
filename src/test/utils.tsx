import type { PropsWithChildren, ReactElement } from 'react';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import eventReducer from 'app/store/slices/eventSlice';
import notificationReducer from 'app/store/slices/notificationSlice';
import authReducer from 'app/store/slices/authSlice';
import labelReducer from 'app/store/slices/labelSlice';
import type { RootState } from 'app/store';
import type { DeepPartial, IRenderOptions } from './types';

export function makeStore(preloadedState?: DeepPartial<RootState>) {
  return configureStore({
    reducer: { events: eventReducer, notifications: notificationReducer, auth: authReducer, labels: labelReducer },
    preloadedState: preloadedState as RootState,
  });
}

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState, initialRoute = '/', ...options }: IRenderOptions = {},
) {
  const store = makeStore(preloadedState);
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
}
