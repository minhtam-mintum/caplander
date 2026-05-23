import { useCallback, useEffect, useRef, useState } from 'react';
import { useController, useFormContext, useFormState } from 'react-hook-form';
import { CalendarDays } from 'lucide-react';
import { Calendar } from 'app/components/molecules/Calendar';
import { Label } from 'app/components/atoms/Label';
import { MONTH_NAMES } from 'app/utils/calendar';

interface IDatePickerRHFProps {
  name: string;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
  minDate?: string;
}

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}

export function DatePickerRHF({
  name,
  label,
  disabled,
  placeholder = 'Select date',
  minDate,
}: IDatePickerRHFProps) {
  const { control } = useFormContext();
  const { field } = useController({ control, name });
  const { errors } = useFormState({ name });
  const errorMessage = errors[name]?.message as string | undefined;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const handleDayClick = useCallback(
    (dateStr: string) => {
      field.onChange(dateStr);
      setIsOpen(false);
    },
    [field],
  );

  const defaultDate = field.value ? new Date(field.value + 'T00:00:00') : undefined;

  return (
    <div ref={containerRef} className='flex flex-col gap-1 relative'>
      {label && <Label htmlFor={name}>{label}</Label>}

      <button
        id={name}
        type='button'
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((o) => !o)}
        className='flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3 text-body-md text-on-surface w-full disabled:opacity-50 disabled:cursor-default'>
        <CalendarDays size={16} className='text-on-surface-variant shrink-0' />
        {field.value ? (
          <span className='flex-1 text-left'>{formatDisplayDate(field.value)}</span>
        ) : (
          <span className='flex-1 text-left text-on-surface-variant/50'>{placeholder}</span>
        )}
      </button>

      {errorMessage && <p className='text-label-sm text-error'>{errorMessage}</p>}

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 z-20 shadow-lg rounded-xl overflow-hidden bg-surface-container-lowest border border-outline-variant p-3 w-80'>
          <Calendar
            defaultDate={defaultDate}
            minDate={minDate}
            onDayClick={handleDayClick}
          />
        </div>
      )}
    </div>
  );
}
