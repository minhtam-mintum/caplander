import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { GhostButton } from 'app/components/molecules/Buttons/GhostButton';
import { IconButton } from 'app/components/molecules/Buttons/IconButton';
import { MonthCalendar } from 'app/components/molecules/Calendar/components/MonthCalendar';
import { MonthPicker } from 'app/components/molecules/Calendar/components/MonthPicker';
import { YearPicker } from 'app/components/molecules/YearPicker';
import { getDecadeStart } from 'app/components/molecules/YearPicker/utils';
import type { IRenderDayProps } from 'app/components/molecules/Calendar/types';
import { MONTH_NAMES } from 'app/utils/calendar';
import { cn } from 'app/utils/cn';
import { dayToDateStr, formatWeekRange, getWeekDays } from 'app/pages/WeekView/utils';
import { WEEK_START } from 'app/pages/WeekView/const';
import type {
  ITitleWeekPageHandle,
  ITitleWeekPageProps,
  WeekPickerStep,
} from 'app/pages/WeekView/types';

export const TitleWeekPage = forwardRef<ITitleWeekPageHandle, ITitleWeekPageProps>(
  function TitleWeekPage({ defaultDate, onWeekChange }, ref) {
    const [selectedDate, setSelectedDate] = useState(defaultDate);
    const [viewDate, setViewDate] = useState(defaultDate);
    const [isOpen, setIsOpen] = useState(false);
    const [pickerStep, setPickerStep] = useState<WeekPickerStep>('day');
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedWeekDays = useMemo(() => getWeekDays(selectedDate, WEEK_START), [selectedDate]);
    const selectedWeekKeys = useMemo(
      () => new Set(selectedWeekDays.map(dayToDateStr)),
      [selectedWeekDays],
    );
    const selectedWeekStartKey = dayToDateStr(selectedWeekDays[0]);
    const selectedWeekEndKey = dayToDateStr(selectedWeekDays[6]);
    const selectedDateKey = dayToDateStr(selectedDate);
    const title = formatWeekRange(selectedWeekDays);
    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();
    const viewMonthKey = `${viewYear}-${viewMonth}`;
    const decadeStart = getDecadeStart(viewYear);

    const setDate = useCallback((date: Date) => {
      setSelectedDate(date);
      setViewDate(date);
      setPickerStep('day');
    }, []);

    useImperativeHandle(ref, () => ({ setDate }), [setDate]);

    useEffect(() => {
      if (!isOpen) return;

      const onPointerDown = (event: PointerEvent) => {
        if (!containerRef.current?.contains(event.target as Node)) {
          setIsOpen(false);
          setPickerStep('day');
        }
      };
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
          setPickerStep('day');
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
        if (!value) setPickerStep('day');
        return !value;
      });
    };

    const handleSelectDay = (date: Date) => {
      setDate(date);
      setIsOpen(false);
      onWeekChange(date);
    };

    const handleSelectMonth = (month: number) => {
      setViewDate((date) => new Date(date.getFullYear(), month, 1));
      setPickerStep('day');
    };

    const handleSelectYear = (year: number) => {
      setViewDate((date) => new Date(year, date.getMonth(), 1));
      setPickerStep('month');
    };

    const handlePrev = useCallback(() => {
      setViewDate((date) => {
        const next = new Date(date);
        next.setDate(1);
        if (pickerStep === 'day') next.setMonth(next.getMonth() - 1);
        else if (pickerStep === 'month') next.setFullYear(next.getFullYear() - 1);
        else next.setFullYear(next.getFullYear() - 10);
        return next;
      });
    }, [pickerStep]);

    const handleNext = useCallback(() => {
      setViewDate((date) => {
        const next = new Date(date);
        next.setDate(1);
        if (pickerStep === 'day') next.setMonth(next.getMonth() + 1);
        else if (pickerStep === 'month') next.setFullYear(next.getFullYear() + 1);
        else next.setFullYear(next.getFullYear() + 10);
        return next;
      });
    }, [pickerStep]);

    const renderDay = useCallback(
      (dayProps: IRenderDayProps) => {
        const date = new Date(dayProps.year, dayProps.month, dayProps.day);
        const dateKey = dayToDateStr(date);
        const isSelected = dateKey === selectedDateKey;
        const isInSelectedWeek = selectedWeekKeys.has(dateKey);
        const isSelectedWeekStart = dateKey === selectedWeekStartKey;
        const isSelectedWeekEnd = dateKey === selectedWeekEndKey;
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        return (
          <div
            className={cn(
              'flex h-9 items-center justify-center',
              isInSelectedWeek && 'bg-primary',
              isSelectedWeekStart && 'rounded-l-lg',
              isSelectedWeekEnd && 'rounded-r-lg',
            )}>
            <GhostButton
              disabled={dayProps.isDisabled}
              onClick={dayProps.onClick}
              className={cn(
                'size-9! justify-center rounded-none! px-0! py-0! text-body-md transition-colors',
                isInSelectedWeek
                  ? 'font-bold text-on-primary! hover:bg-primary/90!'
                  : dayProps.isDisabled
                    ? 'cursor-default text-on-surface-variant/35'
                    : 'rounded-lg! text-on-surface hover:bg-surface-container-low!',
                !isInSelectedWeek && !dayProps.isDisabled && isWeekend && 'text-error',
                !isInSelectedWeek &&
                  dayProps.isToday &&
                  !isSelected &&
                  'font-bold ring-1 ring-primary/50',
                isSelectedWeekStart && 'rounded-l-lg!',
                isSelectedWeekEnd && 'rounded-r-lg!',
              )}>
              {dayProps.day}
            </GhostButton>
          </div>
        );
      },
      [selectedDateKey, selectedWeekEndKey, selectedWeekKeys, selectedWeekStartKey],
    );

    const renderDayLabel = useCallback((label: string, index: number) => {
      const isWeekend = index >= 5;
      return (
        <div className='flex h-8 items-center justify-center'>
          <span
            className={cn(
              'text-label-md font-bold text-on-surface-variant',
              isWeekend && 'text-error',
            )}>
            {label}
          </span>
        </div>
      );
    }, []);

    const headerTitle =
      pickerStep === 'day' ? (
        <div className='flex items-center gap-1'>
          <GhostButton
            className='rounded-md! px-1.5! py-0.5! text-headline-md font-bold! text-on-surface hover:bg-primary-fixed/60! hover:text-primary!'
            onClick={() => setPickerStep('month')}>
            {MONTH_NAMES[viewMonth]}
          </GhostButton>
          <GhostButton
            className='rounded-md! px-1.5! py-0.5! text-headline-md font-bold! text-on-surface hover:bg-primary-fixed/60! hover:text-primary!'
            onClick={() => setPickerStep('year')}>
            {viewYear}
          </GhostButton>
        </div>
      ) : pickerStep === 'month' ? (
        <GhostButton
          className='rounded-md! px-1.5! py-0.5! text-headline-md font-bold! text-on-surface hover:bg-primary-fixed/60! hover:text-primary!'
          onClick={() => setPickerStep('year')}>
          {viewYear}
        </GhostButton>
      ) : (
        <span className='text-headline-md font-bold! text-on-surface'>
          {decadeStart}-{decadeStart + 9}
        </span>
      );

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
          <div className='absolute left-0 top-full mt-2 z-20 w-80 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lg overflow-hidden p-3'>
            <div className='flex flex-col gap-4'>
              <WeekPickerHeader title={headerTitle} onPrev={handlePrev} onNext={handleNext} />
              {pickerStep === 'day' && (
                <MonthCalendar
                  key={viewMonthKey}
                  defaultDate={viewDate}
                  hasMonthName={false}
                  labelFormat='short'
                  classCard='bg-transparent p-0 rounded-none gap-3'
                  classInner='gap-1'
                  classDayLabelRow='gap-x-0 gap-y-1'
                  classWeekGrid='gap-x-0 gap-y-1'
                  onDayClick={handleSelectDay}
                  renderDay={renderDay}
                  renderDayLabel={renderDayLabel}
                />
              )}
              {pickerStep === 'month' && (
                <MonthPicker selectedMonth={viewMonth} onMonthClick={handleSelectMonth} />
              )}
              {pickerStep === 'year' && (
                <YearPicker selectedYear={viewYear} onYearClick={handleSelectYear} />
              )}
            </div>
          </div>
        )}
        <p className='text-body-md text-on-surface-variant'>Weekly Overview &amp; Events</p>
      </div>
    );
  },
);

interface IWeekPickerHeaderProps {
  title: ReactNode;
  onPrev: () => void;
  onNext: () => void;
}

function WeekPickerHeader({ title, onPrev, onNext }: IWeekPickerHeaderProps) {
  return (
    <div className='grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2'>
      <IconButton
        className='size-9! rounded-[10px]! text-on-surface hover:bg-surface-container-low!'
        aria-label='Previous'
        onClick={onPrev}>
        <ChevronLeft size={18} />
      </IconButton>
      <div className='justify-self-center'>{title}</div>
      <IconButton
        className='size-9! rounded-[10px]! text-on-surface hover:bg-surface-container-low!'
        aria-label='Next'
        onClick={onNext}>
        <ChevronRight size={18} />
      </IconButton>
    </div>
  );
}
