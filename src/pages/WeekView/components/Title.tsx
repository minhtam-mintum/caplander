import { forwardRef, useImperativeHandle, useState } from 'react';
import type { ITitleWeekPageHandle, ITitleWeekPageProps } from 'app/pages/WeekView/types';

export const TitleWeekPage = forwardRef<ITitleWeekPageHandle, ITitleWeekPageProps>(
  function TitleWeekPage({ defaultTitle }, ref) {
    const [title, setTitle] = useState(defaultTitle);

    useImperativeHandle(ref, () => ({ setTitle }), []);

    return <h2 className='text-headline-md text-on-surface'>{title}</h2>;
  },
);
