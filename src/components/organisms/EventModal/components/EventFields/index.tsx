import type { ReactNode } from 'react';
import { Bell } from 'lucide-react';
import { Form } from 'app/components/molecules/Form';
import { InputRHF } from 'app/components/molecules/Inputs/InputRHF';
import { SelectRHF } from 'app/components/molecules/Selects/SelectRHF';
import { RichTextEditorRHF } from 'app/components/molecules/RichTextEditor/RichTextEditorRHF';
import { ButtonRHF } from 'app/components/molecules/Buttons/ButtonRHF';
import { CancelButton } from 'app/components/molecules/Buttons/CancelButton';
import { useAppDispatch } from 'app/store';
import { updateEventThunk, createEventThunk } from 'app/store/slices/eventSlice';
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

  const handleSubmit = async (data: EventFormData) => {
    const start = data.startDate.getTime() + data.startTime;
    const end = data.endDate.getTime() + data.endTime;
    const eventData = {
      title: data.name,
      startDate: new Date(start).toISOString(),
      endDate: new Date(end).toISOString(),
      alert: data.alert,
      labelId: data.label,
      description: data.notes || undefined,
      allDay: false,
    };
    if (data.id) {
      await dispatch(updateEventThunk({ _id: data.id, ...eventData })).unwrap();
    } else {
      await dispatch(createEventThunk(eventData)).unwrap();
    }
    onClose();
  };

  return (
    <Form defaultValues={defaultValues} schema={eventModalSchema} onSubmit={handleSubmit} className='flex flex-col flex-1 min-h-0'>
      <div className='px-6 py-5 flex flex-col gap-5 overflow-y-auto flex-1'>
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
