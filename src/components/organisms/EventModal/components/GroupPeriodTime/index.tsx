import { useFormContext } from 'react-hook-form';
import { Clock } from 'lucide-react';
import type { EventFormData } from '../../const';

interface IGroupPeriodTimeProps {
  disabled?: boolean;
}

export function GroupPeriodTime({ disabled }: IGroupPeriodTimeProps) {
  const { register } = useFormContext<EventFormData>();

  return (
    <>
      <div className='flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3'>
        <Clock size={16} className='text-on-surface-variant shrink-0' />
        <input
          {...register('startTime')}
          type='time'
          disabled={disabled}
          className='flex-1 bg-transparent outline-none text-body-md text-on-surface disabled:opacity-50'
        />
      </div>

      <div className='flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3'>
        <Clock size={16} className='text-on-surface-variant shrink-0' />
        <input
          {...register('endTime')}
          type='time'
          disabled={disabled}
          className='flex-1 bg-transparent outline-none text-body-md text-on-surface disabled:opacity-50'
        />
      </div>
    </>
  );
}
