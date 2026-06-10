import type { PropsWithChildren, ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import eventReducer from 'app/store/slices/eventSlice';
import notificationReducer from 'app/store/slices/notificationSlice';
import type { RootState } from 'app/store';

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: { events: eventReducer, notifications: notificationReducer },
    preloadedState: preloadedState as RootState,
  });
}

interface IRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  initialRoute?: string;
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
