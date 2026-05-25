import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useController, useFormContext } from 'react-hook-form';
import { ButtonField } from 'app/components/molecules/Buttons/ButtonField';
import { Label } from 'app/components/atoms/Label';

type ItemOption = { option: ReactNode; value: string | number };
export type SelectItem = ItemOption | { custom: ReactNode };

interface ISelectContext {
  items: ItemOption[];
  setItem: (items: ItemOption[]) => void;
  select: (value: string | number) => void;
  close: () => void;
}

const SelectContext = createContext<ISelectContext | null>(null);

export function useSelectContext(): ISelectContext {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error('useSelectContext must be used inside SelectRHF');
  return ctx;
}

interface ISelectRHFProps {
  name: string;
  label?: string;
  options: SelectItem[];
  icon?: ReactNode;
  disabled?: boolean;
  placeholder?: string;
}

export function SelectRHF({ name, label, options, icon, disabled }: ISelectRHFProps) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ control, name });

  const valueItems: ItemOption[] = options.filter(
    (item): item is { option: ReactNode; value: string | number } => 'value' in item,
  );
  const [items, setItem] = useState<ItemOption[]>(valueItems);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const didOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      didOpenRef.current = true;
    } else if (didOpenRef.current) {
      field.onBlur();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const select = useCallback(
    (value: string | number) => {
      field.onChange(value);
      setIsOpen(false);
    },
    [field],
  );

  const close = useCallback(() => setIsOpen(false), []);

  const customItems = options.filter((item): item is { custom: ReactNode } => 'custom' in item);

  const selectedOption =
    items.find((item) => item.value === field.value)?.option ?? String(field.value ?? '');

  const errorMessage = fieldState.error?.message;

  return (
    <SelectContext.Provider value={{ setItem, select, close, items }}>
      <div ref={containerRef} className='flex flex-col gap-1 relative'>
        {label && <Label>{label}</Label>}
        <ButtonField
          variant='field-trigger'
          type='button'
          disabled={disabled}
          onClick={() => setIsOpen((o) => !o)}
          className={`bg-surface-container-low ${errorMessage ? 'ring-1 ring-error' : ''}`}>
          {icon && <span className='text-on-surface-variant shrink-0'>{icon}</span>}
          <span className='flex-1 text-left'>{selectedOption}</span>
          <ChevronDown
            size={15}
            className={`text-on-surface-variant transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          />
        </ButtonField>
        {errorMessage && <p className='text-label-sm text-error'>{errorMessage}</p>}

        {isOpen && (
          <div className='absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-10 overflow-hidden flex flex-col'>
            <div className='overflow-y-auto max-h-52'>
              {items.map((item) => (
                <ButtonField
                  key={String(item.value)}
                  variant='select-option'
                  type='button'
                  onClick={() => select(item.value)}
                  className={field.value === item.value ? 'text-primary' : 'text-on-surface'}>
                  {field.value === item.value ? (
                    <Check size={14} className='shrink-0' />
                  ) : (
                    <span className='w-3.5 shrink-0' />
                  )}
                  {item.option}
                </ButtonField>
              ))}
            </div>
            {customItems.map((item, i) => (
              <div key={i} className='border-t border-outline-variant'>
                {item.custom}
              </div>
            ))}
          </div>
        )}
      </div>
    </SelectContext.Provider>
  );
}
