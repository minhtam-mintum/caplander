import { GhostButton } from 'app/components/molecules/Buttons/GhostButton';
import { MONTH_NAMES } from 'app/utils/calendar';
import { cn } from 'app/utils/cn';

const SHORT_MONTH_NAMES = MONTH_NAMES.map((m) => m.slice(0, 3));

interface IMonthPickerProps {
  selectedMonth: number;
  onMonthClick: (month: number) => void;
}

export function MonthPicker({ selectedMonth, onMonthClick }: IMonthPickerProps) {
  return (
    <div className='grid grid-cols-3 gap-1 px-1'>
      {SHORT_MONTH_NAMES.map((name, i) => {
        const isSelected = i === selectedMonth;
        return (
          <GhostButton
            key={name}
            onClick={() => onMonthClick(i)}
            className={cn(
              'w-full! rounded-sm! px-3! py-3! text-body-md font-medium',
              isSelected
                ? 'bg-primary! text-on-primary!'
                : 'text-on-surface hover:bg-surface-container-high!',
            )}>
            {name}
          </GhostButton>
        );
      })}
    </div>
  );
}
