import { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { DatePickerRHF } from 'app/components/molecules/DatePicker/DatePickerRHF';
import { Label } from 'app/components/atoms/Label';
import type { EventFormData } from '../../const';

interface IGroupPeriodDateProps {
  disabled?: boolean;
}

export function GroupPeriodDate({ disabled }: IGroupPeriodDateProps) {
  const { trigger } = useFormContext<EventFormData>();
  const startDate = useWatch<EventFormData, 'startDate'>({ name: 'startDate' });
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    trigger('endDate');
  }, [startDate, trigger]);

  return (
    <>
      <div className='flex flex-col gap-1'>
        <Label>Starts</Label>
        <DatePickerRHF name='startDate' disabled={disabled} />
      </div>

      <div className='flex flex-col gap-1'>
        <Label>Ends</Label>
        <DatePickerRHF name='endDate' disabled={disabled} minDate={startDate instanceof Date ? startDate : undefined} />
      </div>
    </>
  );
}
