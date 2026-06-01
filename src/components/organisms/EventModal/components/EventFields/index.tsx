import type { ReactNode } from 'react';
import { Bell } from 'lucide-react';
import { Form } from 'app/components/molecules/Form';
import { InputRHF } from 'app/components/molecules/Inputs/InputRHF';
import { SelectRHF } from 'app/components/molecules/Selects/SelectRHF';
import { RichTextEditorRHF } from 'app/components/molecules/RichTextEditor/RichTextEditorRHF';
import { ButtonRHF } from 'app/components/molecules/Buttons/ButtonRHF';
import { CancelButton } from 'app/components/molecules/Buttons/CancelButton';
import { useAppDispatch } from 'app/store';
import { addEvent, updateEvent } from 'app/store/slices/eventSlice';
import { GroupPeriodDate } from 'app/components/organisms/EventModal/components/GroupPeriodDate';
import { GroupPeriodTime } from 'app/components/organisms/EventModal/components/GroupPeriodTime';
import { LabelSelect } from 'app/components/organisms/EventModal/components/LabelSelect';
import {
  ALERT_OPTIONS,
  eventModalSchema,
  type EventFormData,
} from 'app/components/organisms/EventModal/const';

interface IEventFieldsProps {
  renderFooter: (content: ReactNode) => ReactNode;
  defaultValues: Partial<EventFormData>;
  id?: string;
  onCancel: () => void;
  onClose: () => void;
}

export function EventFields({
  renderFooter,
  defaultValues,
  id,
  onCancel,
  onClose,
}: IEventFieldsProps) {
  const dispatch = useAppDispatch();

  const handleSubmit = (data: EventFormData) => {
    const start = data.startDate.getTime() + data.startTime;
    const end = data.endDate.getTime() + data.endTime;
    const event = {
      name: data.name,
      start,
      end,
      alert: data.alert,
      label: data.label,
      notes: data.notes,
    };
    if (data.id) {
      dispatch(updateEvent({ id: data.id, ...event }));
    } else {
      dispatch(addEvent({ id: crypto.randomUUID(), ...event }));
    }
    onClose();
  };

  return (
    <Form defaultValues={defaultValues} schema={eventModalSchema} onSubmit={handleSubmit}>
      <div className='px-6 py-5 flex flex-col gap-5'>
        <InputRHF name='name' label='Name' />

        <div className='grid grid-cols-2 gap-x-3 gap-y-2'>
          <GroupPeriodDate />
          <GroupPeriodTime />
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <SelectRHF name='alert' label='Alert' options={ALERT_OPTIONS} icon={<Bell size={15} />} />

          <LabelSelect />
        </div>

        <RichTextEditorRHF name='notes' label='Notes' />
      </div>
      {renderFooter(
        <div className='flex justify-end gap-2 w-full'>
          {id && (
            <CancelButton type='button' onClick={onCancel}>
              Cancel
            </CancelButton>
          )}
          <ButtonRHF variant='primary'>{id ? 'Save Changes' : 'Create'}</ButtonRHF>
        </div>,
      )}
    </Form>
  );
}
