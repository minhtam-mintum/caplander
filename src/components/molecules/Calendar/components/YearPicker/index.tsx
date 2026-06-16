import { GhostButton } from 'app/components/molecules/Buttons/GhostButton';
import { cn } from 'app/utils/cn';

interface IYearPickerProps {
  decadeStart: number;
  selectedYear: number;
  onYearClick: (year: number) => void;
}

export function YearPicker({ decadeStart, selectedYear, onYearClick }: IYearPickerProps) {
  // One year before the decade + 10 in decade + one after = 12 cells
  const years = Array.from({ length: 12 }, (_, i) => decadeStart - 1 + i);

  return (
    <div className='grid grid-cols-3 gap-1 px-1'>
      {years.map((year) => {
        const isSelected = year === selectedYear;
        const isOutside = year < decadeStart || year > decadeStart + 9;
        return (
          <GhostButton
            key={year}
            onClick={() => onYearClick(year)}
            className={cn(
              'w-full! rounded-sm! px-3! py-3! text-body-md font-medium justify-center',
              isSelected
                ? 'bg-primary! text-on-primary!'
                : isOutside
                  ? 'text-on-surface-variant hover:bg-surface-container-high!'
                  : 'text-on-surface hover:bg-surface-container-high!',
            )}>
            {year}
          </GhostButton>
        );
      })}
    </div>
  );
}
