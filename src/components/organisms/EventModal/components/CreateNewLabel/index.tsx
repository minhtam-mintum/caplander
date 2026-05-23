import { useEffect, useRef, useState } from 'react';
import { Check, Plus, Tag, X } from 'lucide-react';
import { useSelectContext } from 'app/components/molecules/Selects/SelectRHF';
import type { ILabel } from 'app/hooks/useLabels';

const COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];

interface ICreateNewLabelProps {
  onAdd: (label: ILabel) => void;
}

export function CreateNewLabel({ onAdd }: ICreateNewLabelProps) {
  const { setItem, items } = useSelectContext();
  const [isAdding, setIsAdding] = useState(false);
  const [value, setValue] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) inputRef.current?.focus();
  }, [isAdding]);

  const handleConfirm = () => {
    const trimmed = value.trim();
    if (trimmed) {
      const label: ILabel = { name: trimmed, value: trimmed, color };
      onAdd(label);
      setItem([
        ...items,
        {
          value: trimmed,
          option: (
            <span className='flex items-center gap-2'>
              <Tag size={12} style={{ color }} />
              {trimmed}
            </span>
          ),
        },
      ]);
    }
    setValue('');
    setIsAdding(false);
  };

  const handleCancel = () => {
    setValue('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <button
        type='button'
        onClick={() => setIsAdding(true)}
        className='flex items-center gap-2 w-full px-4 py-2.5 text-body-md text-primary hover:bg-surface-container transition-colors'>
        <Plus size={14} className='shrink-0' />
        Create New Label
      </button>
    );
  }

  return (
    <div className='flex flex-col px-4 py-2.5 gap-2'>
      <div className='flex items-center gap-1.5'>
        {COLORS.map((c) => (
          <button
            key={c}
            type='button'
            onClick={() => setColor(c)}
            style={{ background: c }}
            className={`w-4 h-4 rounded-full transition-transform ${
              color === c
                ? 'ring-2 ring-offset-1 ring-outline-variant scale-110'
                : 'hover:scale-110'
            }`}
          />
        ))}
      </div>
      <div className='flex items-center gap-2'>
        <Tag size={13} style={{ color }} className='shrink-0' />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleConfirm();
            }
            if (e.key === 'Escape') handleCancel();
          }}
          placeholder='Label name…'
          className='flex-1 text-body-md bg-transparent outline-none text-on-surface placeholder:text-on-surface-variant/50'
        />
        <button
          type='button'
          onClick={handleConfirm}
          className='p-1 rounded text-primary hover:bg-surface-container transition-colors'>
          <Check size={14} />
        </button>
        <button
          type='button'
          onClick={handleCancel}
          className='p-1 rounded text-on-surface-variant hover:bg-surface-container transition-colors'>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
