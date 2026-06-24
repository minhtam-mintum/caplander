import { ChevronDown } from 'lucide-react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { GhostButton } from 'app/components/molecules/Buttons/GhostButton';
import { Calendar } from 'app/components/molecules/Calendar';
import { formatFullDate, getDayTitle } from 'app/utils/day';
import { dayToDateStr } from 'app/pages/WeekView/utils';
import type { ITitleDayPageHandle, ITitleDayPageProps } from 'app/pages/DayView/types';

export const TitleDayPage = forwardRef<ITitleDayPageHandle, ITitleDayPageProps>(
  function TitleDayPage({ defaultDate, onDayChange }, ref) {
    const [date, setDateState] = useState(defaultDate);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dateKey = dayToDateStr(date);

    const setDate = useCallback((nextDate: Date) => {
      setDateState(nextDate);
      setIsOpen(false);
    }, []);

    useImperativeHandle(ref, () => ({ setDate }), [setDate]);

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

    const handleToggleOpen = () => {
      setIsOpen((value) => !value);
    };

    const handleDaySelect = useCallback((nextDate: Date) => {
      setDate(nextDate);
      onDayChange(nextDate);
    }, [onDayChange, setDate]);

    return (
      <div ref={containerRef} className='relative'>
        <GhostButton
          className='-ml-2 gap-1! rounded-lg! px-2! py-0.5! hover:bg-surface-container-high!'
          aria-haspopup='dialog'
          aria-expanded={isOpen}
          onClick={handleToggleOpen}>
          <span className='text-headline-lg'>{getDayTitle(date)}</span>
          <ChevronDown
            size={18}
            className={`text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </GhostButton>
        {isOpen && (
          <div className='absolute left-0 top-full mt-2 z-20 w-80 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lg overflow-hidden p-3'>
            <Calendar key={dateKey} defaultDate={date} onDayClick={handleDaySelect} />
          </div>
        )}
        <p className='text-body-md text-on-surface-variant'>{formatFullDate(date)}</p>
      </div>
    );
  },
);
