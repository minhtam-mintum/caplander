import { useCallback, useEffect, useRef, useState } from 'react';
import { useController, useFormContext, useFormState } from 'react-hook-form';
import { CalendarDays } from 'lucide-react';
import { ButtonField } from 'app/components/molecules/Buttons/ButtonField';
import { Calendar } from 'app/components/molecules/Calendar';
import { Label } from 'app/components/atoms/Label';
import { MONTH_NAMES } from 'app/utils/calendar';

interface IDatePickerRHFProps {
  name: string;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
  minDate?: Date;
}

function formatDisplayDate(date: Date): string {
  return `${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
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
  const { errors, touchedFields, isSubmitted } = useFormState({ name });
  const errorMessage =
    touchedFields[name] || isSubmitted ? (errors[name]?.message as string | undefined) : undefined;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        field.onBlur();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, field.onBlur]);

  const handleDayClick = useCallback(
    (date: Date) => {
      field.onChange(date);
      setIsOpen(false);
    },
    [field],
  );

  const defaultDate = field.value instanceof Date ? field.value : undefined;

  return (
    <div ref={containerRef} className='flex flex-col gap-1 relative'>
      {label && <Label htmlFor={name}>{label}</Label>}

      <ButtonField
        id={name}
        variant='field-trigger'
        type='button'
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((o) => !o)}
        className='bg-surface-container-low w-full'>
        <CalendarDays size={16} className='text-on-surface-variant shrink-0' />
        {field.value instanceof Date ? (
          <span className='flex-1 text-left'>{formatDisplayDate(field.value)}</span>
        ) : (
          <span className='flex-1 text-left text-on-surface-variant/50'>{placeholder}</span>
        )}
      </ButtonField>

      {errorMessage && <p className='text-label-sm text-error'>{errorMessage}</p>}

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 z-20 shadow-lg rounded-xl overflow-hidden bg-surface-container-lowest border border-outline-variant p-3 w-80'>
          <Calendar defaultDate={defaultDate} minDate={minDate} onDayClick={handleDayClick} />
        </div>
      )}
    </div>
  );
}
