import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { router } from './routes';
import './index.css';

function AppRoot() {
  useEffect(() => {
    document.getElementById('splash')?.remove();
  }, []);

  return <RouterProvider router={router} />;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AppRoot />
    </Provider>
  </StrictMode>,
);
