import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from 'app/components/atoms/button';

interface INavigationControlsProps {
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function NavigationControls({ onPrev, onNext, onToday }: INavigationControlsProps) {
  return (
    <div className='flex items-center gap-1'>
      <Button variant='ghost' onClick={onToday} className='text-body-md'>
        Today
      </Button>
      <Button variant='icon' onClick={onPrev} aria-label='Previous'>
        <ChevronLeft size={16} />
      </Button>
      <Button variant='icon' onClick={onNext} aria-label='Next'>
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
