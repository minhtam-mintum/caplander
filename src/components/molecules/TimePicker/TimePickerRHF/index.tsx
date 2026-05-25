import { useCallback, useEffect, useRef, useState } from 'react';
import { useController, useFormContext, useFormState } from 'react-hook-form';
import { Clock } from 'lucide-react';
import { Label } from 'app/components/atoms/Label';
import { HOURS, MINUTES, ITEM_H, SCROLL_PADDING } from '../const';
import { parseTime } from '../utils';

interface ITimePickerRHFProps {
  name: string;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
}


export function TimePickerRHF({
  name,
  label,
  disabled,
  placeholder = 'Select time',
}: ITimePickerRHFProps) {
  const { control } = useFormContext();
  const { field } = useController({ control, name });
  const { errors, touchedFields, isSubmitted } = useFormState({ name });
  const errorMessage =
    (touchedFields[name] || isSubmitted) ? (errors[name]?.message as string | undefined) : undefined;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLUListElement>(null);
  const minuteListRef = useRef<HTMLUListElement>(null);

  const { h: selectedH, m: selectedM } = parseTime(field.value ?? 0);

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

  useEffect(() => {
    if (!isOpen) return;
    const scrollToCenter = (el: HTMLUListElement | null, idx: number) => {
      if (!el || idx < 0) return;
      el.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
    };
    scrollToCenter(hourListRef.current, HOURS.indexOf(selectedH));
    scrollToCenter(minuteListRef.current, MINUTES.indexOf(selectedM));
  }, [isOpen, selectedH, selectedM]);

  const selectHour = useCallback(
    (h: string) => {
      field.onChange(Number(h) * 3600000 + Number(selectedM) * 60000);
    },
    [field, selectedM],
  );

  const selectMinute = useCallback(
    (m: string) => {
      field.onChange(Number(selectedH) * 3600000 + Number(m) * 60000);
    },
    [field, selectedH],
  );

  return (
    <div ref={containerRef} className='flex flex-col gap-1 relative'>
      {label && <Label htmlFor={name}>{label}</Label>}

      <button
        id={name}
        type='button'
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((o) => !o)}
        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-body-md text-on-surface w-full disabled:opacity-50 disabled:cursor-default transition-colors ${
          isOpen
            ? 'bg-primary/10 ring-2 ring-primary'
            : 'bg-surface-container-low hover:bg-surface-container'
        }`}>
        <Clock size={16} className='text-on-surface-variant shrink-0' />
        {field.value != null ? (
          <span className='flex-1 text-left font-medium tracking-wide'>{selectedH}:{selectedM}</span>
        ) : (
          <span className='flex-1 text-left text-on-surface-variant/50'>{placeholder}</span>
        )}
      </button>

      {errorMessage && <p className='text-label-sm text-error'>{errorMessage}</p>}

      {isOpen && (
        <div className='absolute top-full left-0 mt-2 z-20 shadow-xl rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant w-44'>
          <div className='flex'>
            <ColumnHeader label='H' />
            <div className='w-px bg-outline-variant self-stretch' />
            <ColumnHeader label='M' />
          </div>
          <div className='h-px bg-outline-variant' />
          <div className='flex'>
            <ul
              ref={hourListRef}
              style={{ paddingBlock: SCROLL_PADDING }}
              className='flex-1 overflow-y-auto max-h-45 scroll-smooth overscroll-contain scrollbar-hide'>
              {HOURS.map((h) => (
                <TimeItem
                  key={h}
                  value={h}
                  selected={h === selectedH}
                  onClick={() => selectHour(h)}
                />
              ))}
            </ul>
            <div className='w-px bg-outline-variant self-stretch' />
            <ul
              ref={minuteListRef}
              style={{ paddingBlock: SCROLL_PADDING }}
              className='flex-1 overflow-y-auto max-h-45 scroll-smooth overscroll-contain scrollbar-hide'>
              {MINUTES.map((m) => (
                <TimeItem
                  key={m}
                  value={m}
                  selected={m === selectedM}
                  onClick={() => selectMinute(m)}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

interface IColumnHeaderProps {
  label: string;
}

function ColumnHeader({ label }: IColumnHeaderProps) {
  return (
    <div className='flex-1 flex items-center justify-center py-2'>
      <span className='text-label-sm font-semibold text-primary tracking-widest uppercase'>
        {label}
      </span>
    </div>
  );
}

interface ITimeItemProps {
  value: string;
  selected: boolean;
  onClick: () => void;
}

function TimeItem({ value, selected, onClick }: ITimeItemProps) {
  return (
    <li>
      <button
        type='button'
        onClick={onClick}
        className={`w-full h-9 flex items-center justify-center text-body-md font-medium transition-colors ${
          selected ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-container'
        }`}>
        {value}
      </button>
    </li>
  );
}
