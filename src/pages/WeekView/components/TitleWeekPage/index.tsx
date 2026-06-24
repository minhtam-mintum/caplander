import { ChevronDown } from 'lucide-react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { GhostButton } from 'app/components/molecules/Buttons/GhostButton';
import { WEEK_START } from 'app/pages/WeekView/const';
import { formatWeekRange, getWeekDays } from 'app/pages/WeekView/utils';
import { WeekPickerDropdown } from './WeekPickerDropdown';
import type { ITitleWeekPageHandle } from './types';

export type { ITitleWeekPageHandle } from './types';

interface ITitleWeekPageProps {
  defaultDate: Date;
  onWeekChange: (date: Date) => void;
}

export const TitleWeekPage = forwardRef<ITitleWeekPageHandle, ITitleWeekPageProps>(
  function TitleWeekPage({ defaultDate, onWeekChange }, ref) {
    const [selectedDate, setSelectedDate] = useState(defaultDate);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedWeekDays = useMemo(() => getWeekDays(selectedDate, WEEK_START), [selectedDate]);
    const title = formatWeekRange(selectedWeekDays);

    const setDate = useCallback((date: Date) => {
      setSelectedDate(date);
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

    const handleDateSelect = useCallback((date: Date) => {
      setDate(date);
      setIsOpen(false);
      onWeekChange(date);
    }, [onWeekChange, setDate]);

    return (
      <div ref={containerRef} className='relative'>
        <GhostButton
          className='-ml-2 gap-1! rounded-lg! px-2! py-0.5! hover:bg-surface-container-high!'
          aria-haspopup='dialog'
          aria-expanded={isOpen}
          onClick={handleToggleOpen}>
          <span className='text-headline-lg'>{title}</span>
          <ChevronDown
            size={18}
            className={`text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </GhostButton>
        {isOpen && (
          <WeekPickerDropdown selectedDate={selectedDate} onDateSelect={handleDateSelect} />
        )}
        <p className='text-body-md text-on-surface-variant'>Weekly Overview &amp; Events</p>
      </div>
    );
  },
);
