import { ROUTES } from 'app/constants/route';
import type { ComponentType } from 'react';

export interface AppRoute {
  path: string;
  lazy: () => Promise<{ Component: ComponentType }>;
}

export const appRoutes: AppRoute[] = [
  {
    path: ROUTES.YEAR,
    lazy: async () => {
      const { YearView } = await import('app/pages/YearView');
      return { Component: YearView };
    },
  },
  {
    path: ROUTES.MONTH,
    lazy: async () => {
      const { MonthView } = await import('app/pages/MonthView');
      return { Component: MonthView };
    },
  },
  {
    path: ROUTES.WEEK,
    lazy: async () => {
      const { WeekView } = await import('app/pages/WeekView');
      return { Component: WeekView };
    },
  },
  {
    path: ROUTES.DAY,
    lazy: async () => {
      const { DayView } = await import('app/pages/DayView');
      return { Component: DayView };
    },
  },
];
