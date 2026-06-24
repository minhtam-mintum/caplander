import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { IconButton } from 'app/components/molecules/Buttons/IconButton';

interface IWeekPickerHeaderProps {
  title: ReactNode;
  onPrev: () => void;
  onNext: () => void;
}

export function WeekPickerHeader({ title, onPrev, onNext }: IWeekPickerHeaderProps) {
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
