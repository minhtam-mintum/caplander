import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Modal } from 'app/components/molecules/Modal';
import { Form, type IFormHandle } from 'app/components/molecules/Form';
import { ButtonRHF } from 'app/components/molecules/Buttons/ButtonRHF';
import { CancelButton } from 'app/components/molecules/Buttons/CancelButton';
import { useEvents } from 'app/hooks/useEvents';
import { eventModalSchema, type EventFormData } from './const';
import { EventFields } from './EventFields';
import { EventDetail } from './EventDetail';

export type { EventFormData } from './const';

export interface IEventModalHandle {
  open: (initialData?: Partial<EventFormData>, id?: string) => void;
  close: () => void;
}

interface IEventModalProps {
  onClose?: () => void;
}

export const EventModal = forwardRef<IEventModalHandle, IEventModalProps>(function EventModal(
  { onClose: controlledOnClose },
  ref,
) {
  const { addEvent, updateEvent } = useEvents();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [openData, setOpenData] = useState<Partial<EventFormData> | undefined>(undefined);
  const [openId, setOpenId] = useState<string | undefined>(undefined);
  const formRef = useRef<IFormHandle<EventFormData>>(null);
  const formId = openId ?? crypto.randomUUID();
  useImperativeHandle(
    ref,
    () => ({
      open: (data?, id?) => {
        setIsEditing(false);
        setOpenData(data);
        setOpenId(id);
        setIsOpen(true);
      },
      close: () => {
        setIsOpen(false);
      },
    }),
    [],
  );
  useEffect(() => {
    if (isEditing) formRef.current?.reset(openData);
  }, [isEditing, openData]);
  const isDetail = !!openData?.name;

  const handleClose = useCallback(() => {
    setIsOpen(false);
    controlledOnClose?.();
  }, [controlledOnClose]);

  const onSubmit = (data: EventFormData) => {
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
    if (openId) {
      updateEvent(openId, { id: openId, ...event });
    } else {
      addEvent({ id: crypto.randomUUID(), ...event });
    }
    handleClose();
  };

  const headerTitle = isDetail ? (openData?.name ?? '') : 'New Event';
  return (
    <Form
      ref={formRef}
      schema={eventModalSchema}
      onSubmit={onSubmit}
      onSubmitError={(e) => console.log('submit errors:', e)}
      id={formId}>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        header={
          <>
            <CalendarDays size={20} className='text-primary shrink-0' />
            <h2 className='flex-1 text-headline-md text-on-surface'>{headerTitle}</h2>
          </>
        }
        footer={
          isDetail && !isEditing ? undefined : (
            <div className='flex justify-end gap-2 w-full'>
              {isEditing && (
                <CancelButton type='button' onClick={() => setIsEditing(false)}>
                  Cancel
                </CancelButton>
              )}
              <ButtonRHF
                form={formId}
                variant='primary'
                requireDirty={!isDetail}
                requireValid={!isDetail}>
                {isDetail ? 'Save Changes' : 'Create'}
              </ButtonRHF>
            </div>
          )
        }>
        {isDetail && !isEditing ? (
          <EventDetail data={openData} onEdit={() => setIsEditing(true)} />
        ) : (
          <EventFields />
        )}
      </Modal>
    </Form>
  );
});
