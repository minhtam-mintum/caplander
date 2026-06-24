import { GhostButton } from 'app/components/molecules/Buttons/GhostButton';
import { MONTH_NAMES } from 'app/utils/calendar';
import type { WeekPickerStep } from './types';

interface IWeekPickerHeaderTitleProps {
  decadeStart: number;
  pickerStep: WeekPickerStep;
  setPickerStep: (step: WeekPickerStep) => void;
  viewMonth: number;
  viewYear: number;
}

export function WeekPickerHeaderTitle({
  decadeStart,
  pickerStep,
  setPickerStep,
  viewMonth,
  viewYear,
}: IWeekPickerHeaderTitleProps) {
  if (pickerStep === 'day') {
    return (
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
    );
  }

  if (pickerStep === 'month') {
    return (
      <GhostButton
        className='rounded-md! px-1.5! py-0.5! text-headline-md font-bold! text-on-surface hover:bg-primary-fixed/60! hover:text-primary!'
        onClick={() => setPickerStep('year')}>
        {viewYear}
      </GhostButton>
    );
  }

  return (
    <span className='text-headline-md font-bold! text-on-surface'>
      {decadeStart}-{decadeStart + 9}
    </span>
  );
}
