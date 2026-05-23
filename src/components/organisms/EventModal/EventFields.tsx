import { useFormContext } from 'react-hook-form';
import { Bold, Bell, Italic, Link2, List, Tag } from 'lucide-react';
import { Label } from 'app/components/atoms/Label';
import { InputRHF } from 'app/components/molecules/Inputs/InputRHF';
import { SelectRHF } from 'app/components/molecules/Selects/SelectRHF';
import { GroupPeriodDate } from './components/GroupPeriodDate';
import { GroupPeriodTime } from './components/GroupPeriodTime';
import type { EventFormData } from './const';
import { ALERT_OPTIONS, LABEL_OPTIONS } from './const';

interface IEventFieldsProps {
  canEditAll: boolean;
}

export function EventFields({ canEditAll }: IEventFieldsProps) {
  const { register } = useFormContext<EventFormData>();

  return (
    <div className='px-6 py-5 flex flex-col gap-5'>
      <InputRHF name='name' label='Name' disabled={!canEditAll} />

      <div className='grid grid-cols-2 gap-x-3 gap-y-2'>
        <GroupPeriodDate disabled={!canEditAll} />
        <GroupPeriodTime disabled={!canEditAll} />
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <SelectRHF
          name='alert'
          label='Alert'
          options={ALERT_OPTIONS}
          icon={<Bell size={15} />}
          disabled={!canEditAll}
        />

        <SelectRHF
          name='label'
          label='Label'
          options={LABEL_OPTIONS}
          icon={<Tag size={15} />}
          disabled={!canEditAll}
        />
      </div>

      <div className='flex flex-col gap-2'>
        <Label className='uppercase tracking-widest'>Notes</Label>
        <div className='border border-outline-variant rounded-xl overflow-hidden'>
          <div className='flex items-center gap-0.5 px-3 py-2 border-b border-outline-variant bg-surface-container-low'>
            {[
              { Icon: Bold, title: 'Bold' },
              { Icon: Italic, title: 'Italic' },
              { Icon: List, title: 'List' },
              { Icon: Link2, title: 'Link' },
            ].map(({ Icon, title }) => (
              <button
                key={title}
                type='button'
                title={title}
                className='p-1.5 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors'>
                <Icon size={15} />
              </button>
            ))}
          </div>
          <textarea
            {...register('notes')}
            placeholder='Add notes…'
            rows={5}
            disabled={!canEditAll}
            className='w-full px-4 py-3 text-body-md text-on-surface bg-transparent outline-none resize-none placeholder:text-on-surface-variant/50 disabled:opacity-50'
          />
        </div>
      </div>
    </div>
  );
}
