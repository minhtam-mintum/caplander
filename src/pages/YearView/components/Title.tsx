import { forwardRef, useImperativeHandle, useState } from 'react';
import type { ITitleYearPageHandle, ITitleYearPageProps } from 'app/pages/YearView/types';
export const TitleYearPage = forwardRef<ITitleYearPageHandle, ITitleYearPageProps>(
  function TitleYearPage({ defaultYear }, ref) {
    const [year, setYear] = useState<number>(defaultYear);
    useImperativeHandle(
      ref,
      () => ({
        setYear,
      }),
      [],
    );
    return (
      <div>
        <h2 className='text-headline-lg text-on-surface'>{year}</h2>
        <p className='text-[15px] text-on-surface-variant mt-0.5'>Yearly Overview &amp; Heatmap</p>
      </div>
    );
  },
);

export default TitleYearPage;
