import { GhostButton } from 'app/components/molecules/Buttons/GhostButton';
import { cn } from 'app/utils/cn';

import { getDecadeStart } from './utils';

interface IYearPickerProps {
  selectedYear: number;
  onYearClick: (year: number) => void;
  startYear?: number;
  yearCount?: number;
  activeStartYear?: number;
  activeEndYear?: number;
  ariaLabel?: string;
  className?: string;
  buttonClassName?: string;
  selectedButtonClassName?: string;
  outsideButtonClassName?: string;
  unselectedButtonClassName?: string;
}

export function YearPicker({
  selectedYear,
  onYearClick,
  startYear,
  yearCount = 12,
  activeStartYear,
  activeEndYear,
  ariaLabel = 'Select year',
  className,
  buttonClassName,
  selectedButtonClassName,
  outsideButtonClassName,
  unselectedButtonClassName,
}: IYearPickerProps) {
  const decadeStart = getDecadeStart(selectedYear);
  const resolvedStartYear = startYear ?? decadeStart - 1;
  const resolvedActiveStartYear =
    activeStartYear ?? (startYear === undefined ? decadeStart : resolvedStartYear);
  const resolvedActiveEndYear =
    activeEndYear ?? (startYear === undefined ? decadeStart + 9 : resolvedStartYear + yearCount - 1);
  const years = Array.from({ length: yearCount }, (_, i) => resolvedStartYear + i);

  return (
    <div
      className={cn('grid grid-cols-3 gap-1 px-1', className)}
      role='listbox'
      aria-label={ariaLabel}>
      {years.map((year) => {
        const isSelected = year === selectedYear;
        const isOutside = year < resolvedActiveStartYear || year > resolvedActiveEndYear;
        return (
          <GhostButton
            key={year}
            role='option'
            aria-selected={isSelected}
            onClick={() => onYearClick(year)}
            className={cn(
              'w-full! rounded-sm! px-3! py-3! text-body-md font-medium justify-center',
              buttonClassName,
              isSelected
                ? cn('bg-primary! text-on-primary!', selectedButtonClassName)
                : isOutside
                  ? cn('text-on-surface-variant hover:bg-surface-container-high!', outsideButtonClassName)
                  : cn('text-on-surface hover:bg-surface-container-high!', unselectedButtonClassName),
            )}>
            {year}
          </GhostButton>
        );
      })}
    </div>
  );
}
