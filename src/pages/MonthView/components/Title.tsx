import { forwardRef, useImperativeHandle, useState } from 'react';
import type { ITitleMonthPageHandle, ITitleMonthPageProps } from 'app/pages/MonthView/types';

export const TitleMonthPage = forwardRef<ITitleMonthPageHandle, ITitleMonthPageProps>(
  function TitleMonthPage({ defaultTitle }, ref) {
    const [title, setTitle] = useState(defaultTitle);

    useImperativeHandle(ref, () => ({ setTitle }), []);

    return (
      <div>
        <h2 className='text-headline-lg text-on-surface'>{title}</h2>
        <p className='text-body-md text-on-surface-variant'>Monthly Overview &amp; Events</p>
      </div>
    );
  },
);
