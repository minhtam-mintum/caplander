import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { GhostButton } from 'app/components/molecules/Buttons/GhostButton';
import { IconButton } from 'app/components/molecules/Buttons/IconButton';
import { MonthPicker } from 'app/components/molecules/Calendar/components/MonthPicker';
import { YearPicker } from 'app/components/molecules/YearPicker';
import { getYearGroupStart, YEAR_GROUP_SIZE } from 'app/components/molecules/YearPicker/utils';
import type { ITitleMonthPageHandle, ITitleMonthPageProps, PickerStep } from 'app/pages/MonthView/types';
import { MONTH_NAMES } from 'app/utils/calendar';

export const TitleMonthPage = forwardRef<ITitleMonthPageHandle, ITitleMonthPageProps>(
  function TitleMonthPage({ defaultDate, onMonthChange }, ref) {
    const [year, setYear] = useState(defaultDate.getFullYear());
    const [month, setMonth] = useState(defaultDate.getMonth());
    const [isOpen, setIsOpen] = useState(false);
    const [pickerStep, setPickerStep] = useState<PickerStep>('year');
    const [yearGroupStart, setYearGroupStart] = useState(getYearGroupStart(defaultDate.getFullYear()));
    const containerRef = useRef<HTMLDivElement>(null);
    const yearGroupEnd = yearGroupStart + YEAR_GROUP_SIZE - 1;

    const setDate = useCallback((date: Date) => {
      const nextYear = date.getFullYear();
      setYear(nextYear);
      setMonth(date.getMonth());
      setYearGroupStart(getYearGroupStart(nextYear));
      setIsOpen(false);
      setPickerStep('year');
    }, []);

    useImperativeHandle(ref, () => ({ setDate }), [setDate]);

    useEffect(() => {
      if (!isOpen) return;

      const onPointerDown = (event: PointerEvent) => {
        if (!containerRef.current?.contains(event.target as Node)) {
          setIsOpen(false);
          setPickerStep('year');
        }
      };
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
          setPickerStep('year');
        }
      };

      document.addEventListener('pointerdown', onPointerDown);
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.removeEventListener('pointerdown', onPointerDown);
        document.removeEventListener('keydown', onKeyDown);
      };
    }, [isOpen]);

    const handleToggleOpen = () => {
      setIsOpen((value) => {
        if (!value) setPickerStep('year');
        return !value;
      });
    };

    const handleSelectYear = (selectedYear: number) => {
      setYear(selectedYear);
      setYearGroupStart(getYearGroupStart(selectedYear));
      setPickerStep('month');
    };

    const handleSelectMonth = (selectedMonth: number) => {
      const nextDate = new Date(year, selectedMonth, 1);
      setMonth(selectedMonth);
      setIsOpen(false);
      setPickerStep('year');
      onMonthChange(nextDate);
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
          onClick={handleToggleOpen}>
          <span className='text-headline-lg'>
            {MONTH_NAMES[month]} {year}
          </span>
          <ChevronDown
            size={18}
            className={`text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </GhostButton>
        {isOpen && (
          <div className='absolute left-0 top-full mt-2 z-20 w-80 rounded-[14px] border border-outline-variant bg-surface-container shadow-lg overflow-hidden p-2'>
            {pickerStep === 'year' ? (
              <>
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
              </>
            ) : (
              <>
                <div className='flex items-center gap-2 px-1 pb-2'>
                  <IconButton
                    className='size-9! rounded-[10px]! hover:bg-surface-container-high!'
                    aria-label='Choose year'
                    onClick={() => setPickerStep('year')}>
                    <ChevronLeft size={16} />
                  </IconButton>
                  <p className='text-label-lg font-medium text-on-surface'>{year}</p>
                </div>
                <MonthPicker selectedMonth={month} onMonthClick={handleSelectMonth} />
              </>
            )}
          </div>
        )}
        <p className='text-body-md text-on-surface-variant'>Monthly Overview &amp; Events</p>
      </div>
    );
  },
);
