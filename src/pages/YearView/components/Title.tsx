import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { GhostButton } from 'app/components/molecules/Buttons/GhostButton';
import { IconButton } from 'app/components/molecules/Buttons/IconButton';
import { YearPicker } from 'app/components/molecules/YearPicker';
import { getYearGroupStart, YEAR_GROUP_SIZE } from 'app/components/molecules/YearPicker/utils';
import type { ITitleYearPageHandle, ITitleYearPageProps } from 'app/pages/YearView/types';

export const TitleYearPage = forwardRef<ITitleYearPageHandle, ITitleYearPageProps>(
  function TitleYearPage({ defaultYear, onYearChange }, ref) {
    const [year, setYear] = useState<number>(defaultYear);
    const [isOpen, setIsOpen] = useState(false);
    const [yearGroupStart, setYearGroupStart] = useState(getYearGroupStart(defaultYear));
    const containerRef = useRef<HTMLDivElement>(null);
    const yearGroupEnd = yearGroupStart + YEAR_GROUP_SIZE - 1;

    useImperativeHandle(
      ref,
      () => ({
        setYear: (nextYear) => {
          setYear((currentYear) => {
            const resolvedYear = typeof nextYear === 'function' ? nextYear(currentYear) : nextYear;
            setYearGroupStart(getYearGroupStart(resolvedYear));
            return resolvedYear;
          });
          setIsOpen(false);
        },
      }),
      [],
    );

    useEffect(() => {
      if (!isOpen) return;

      const onPointerDown = (event: PointerEvent) => {
        if (!containerRef.current?.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
        }
      };

      document.addEventListener('pointerdown', onPointerDown);
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.removeEventListener('pointerdown', onPointerDown);
        document.removeEventListener('keydown', onKeyDown);
      };
    }, [isOpen]);

    const handleSelectYear = (selectedYear: number) => {
      setYear(selectedYear);
      setYearGroupStart(getYearGroupStart(selectedYear));
      setIsOpen(false);
      onYearChange(selectedYear);
    };

    const handlePrevYearGroup = () => {
      setYearGroupStart((start) => start - YEAR_GROUP_SIZE);
    };

    const handleNextYearGroup = () => {
      setYearGroupStart((start) => start + YEAR_GROUP_SIZE);
    };

    return (
      <div ref={containerRef} className='relative'>
        <GhostButton
          className='-ml-2 gap-1! rounded-lg! px-2! py-0.5! hover:bg-surface-container-high!'
          aria-haspopup='listbox'
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}>
          <span className='text-headline-lg'>{year}</span>
          <ChevronDown
            size={18}
            className={`text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </GhostButton>
        {isOpen && (
          <div className='absolute left-0 top-full mt-2 z-20 w-80 rounded-[14px] border border-outline-variant bg-surface-container shadow-lg overflow-hidden p-2'>
            <div className='flex items-center justify-between gap-2 px-1 pb-2'>
              <IconButton
                className='size-9! rounded-[10px]! hover:bg-surface-container-high!'
                aria-label='Previous year group'
                onClick={handlePrevYearGroup}>
                <ChevronLeft size={16} />
              </IconButton>
              <p className='text-label-lg font-medium text-on-surface'>
                {yearGroupStart} - {yearGroupEnd}
              </p>
              <IconButton
                className='size-9! rounded-[10px]! hover:bg-surface-container-high!'
                aria-label='Next year group'
                onClick={handleNextYearGroup}>
                <ChevronRight size={16} />
              </IconButton>
            </div>
            <YearPicker
              selectedYear={year}
              startYear={yearGroupStart}
              yearCount={YEAR_GROUP_SIZE}
              className='gap-2 px-0'
              buttonClassName='rounded-[10px]! text-body-md!'
              unselectedButtonClassName='hover:bg-surface-container-high!'
              onYearClick={handleSelectYear}
            />
          </div>
        )}
        <p className='text-[15px] text-on-surface-variant mt-0.5'>Yearly Overview &amp; Heatmap</p>
      </div>
    );
  },
);

export default TitleYearPage;
