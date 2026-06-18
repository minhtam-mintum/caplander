import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  IRenderDayProps,
  MonthCalendar,
} from 'app/components/molecules/Calendar/components/MonthCalendar';
import { HeatmapDay } from 'app/components/molecules/HeatmapDay';
import { useAppSelector } from 'app/store';
import { toDateStr } from 'app/utils/calendar';
import type { IFullMonthInYearHandle, IFullMonthInYearProps } from 'app/pages/YearView/types';
import { getEventEndMs, getEventStartMs } from 'app/utils/event';

export const FullMonthInYear = forwardRef<IFullMonthInYearHandle, IFullMonthInYearProps>(
  function FullMonthInYear({ defaultYear = new Date().getFullYear(), onDaySelect }, ref) {
    const yearCursor = useRef(defaultYear);
    const [, forceUpdate] = useState(0);
    const events = useAppSelector((state) => state.events.items);
    useImperativeHandle(
      ref,
      () => ({
        onSetYear: (newYear: number) => {
          yearCursor.current = newYear;
          forceUpdate((n) => n + 1);
        },
        /** Resets the displayed year back to `defaultYear` (falls back to the current year if `defaultYear` was not provided). */
        onResetYear: () => {
          yearCursor.current = defaultYear;
          forceUpdate((n) => n + 1);
        },
        getYear: () => {
          return yearCursor.current;
        },
      }),
      [],
    );
    const countByDate = useMemo(() => {
      const map: Record<string, number> = {};
      for (const event of events) {
        const startDay = Math.floor(getEventStartMs(event) / 86400000) * 86400000;
        const endDay = Math.floor(getEventEndMs(event) / 86400000) * 86400000;
        for (let day = startDay; day <= endDay; day += 86400000) {
          const d = new Date(day);
          const key = toDateStr(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
          map[key] = (map[key] ?? 0) + 1;
        }
      }
      return map;
    }, [events]);

    const renderDay = ({ day, year, month, isCurrentMonth }: IRenderDayProps) => (
      <>
        {isCurrentMonth && (
          <HeatmapDay
            day={day}
            count={countByDate[toDateStr(year, month, day)] ?? 0}
            onClick={() => onDaySelect(new Date(Date.UTC(year, month, day)))}
          />
        )}
      </>
    );
    return (
      <div className='grid grid-cols-2 xl:grid-cols-4 gap-3.5'>
        {Array.from({ length: 12 }, (_, month) => (
          <MonthCalendar
            key={yearCursor.current * 12 + month}
            defaultDate={new Date(yearCursor.current, month, 1)}
            labelFormat='short'
            highlightToday={false}
            classCard='border border-outline-variant rounded-[14px] p-[14px] pb-3 gap-2.5'
            onDayClick={onDaySelect}
            renderDay={renderDay}
          />
        ))}
      </div>
    );
  },
);
