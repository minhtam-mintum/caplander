import type { ReactNode } from 'react';
import { Button } from 'app/components/atoms/Button';
import { NavigationControls } from 'app/components/molecules/NavigationControls';

interface IToolbarProps {
  title: ReactNode;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onFilter?: () => void;
  align?: 'start' | 'center' | 'end';
}

const ALIGN = { start: 'items-start', center: 'items-center', end: 'items-end' } as const;

export function Toolbar({
  title,
  onPrev,
  onNext,
  onToday,
  onFilter,
  align = 'center',
}: IToolbarProps) {
  return (
    <div className={`flex justify-between ${ALIGN[align]}`}>
      {title}
      <div className='flex items-center gap-2'>
        <NavigationControls onPrev={onPrev} onNext={onNext} onToday={onToday} />
        {onFilter && (
          <Button variant='secondary' onClick={onFilter}>
            Filter
          </Button>
        )}
      </div>
    </div>
  );
}
