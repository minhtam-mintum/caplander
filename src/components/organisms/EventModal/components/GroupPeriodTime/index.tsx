import { TimePickerRHF } from 'app/components/molecules/TimePicker/TimePickerRHF';

interface IGroupPeriodTimeProps {
  disabled?: boolean;
}

export function GroupPeriodTime({ disabled }: IGroupPeriodTimeProps) {
  return (
    <>
      <TimePickerRHF name='startTime' label='Start Time' disabled={disabled} />
      <TimePickerRHF name='endTime' label='End Time' disabled={disabled} />
    </>
  );
}
