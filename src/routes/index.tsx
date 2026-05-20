import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from 'app/constants/route';
import { LoadingPage } from 'app/components/organisms/LoadingPage';
import App from '../App';
import { RouteLayout } from './RouteLayout';
import { appRoutes } from './appRoutes';

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <App />,
    HydrateFallback: LoadingPage,
    children: [
      {
        element: <RouteLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.MONTH} replace /> },
          ...appRoutes.map(({ path, lazy }) => ({
            path: path.slice(1),
            lazy,
          })),
        ],
      },
    ],
  },
]);
