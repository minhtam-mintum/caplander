import { cn } from 'app/utils/cn';

interface IDayLabelProps {
  label: string;
  classDayLabel?: string;
}

export function DayLabel({ label, classDayLabel }: IDayLabelProps) {
  return (
    <div className='flex items-center justify-center aspect-square'>
      <span className={cn('text-label-sm @[320px]:text-label-md text-on-surface-variant', classDayLabel)}>{label}</span>
    </div>
  );
}
