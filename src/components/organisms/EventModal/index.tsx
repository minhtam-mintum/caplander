import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { CalendarDays, Pencil } from 'lucide-react';
import { Modal } from 'app/components/molecules/Modal';
import { Form, type IFormHandle } from 'app/components/molecules/Form';
import { ButtonRHF } from 'app/components/molecules/Buttons/ButtonRHF';
import { eventModalSchema, type EventFormData } from './const';
import { EventFields } from './EventFields';

export type { EventFormData } from './const';

const FORM_ID = 'event-modal-form';

export interface IEventModalHandle {
  open: (initialData?: Partial<EventFormData>) => void;
  close: () => void;
}

interface IEventModalProps {
  onClose?: () => void;
  initialData?: Partial<EventFormData>;
}

export const EventModal = forwardRef<IEventModalHandle, IEventModalProps>(function EventModal(
  { onClose: controlledOnClose, initialData },
  ref,
) {
  const [isOpen, setIsOpen] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const formRef = useRef<IFormHandle<EventFormData>>(null);

  useImperativeHandle(
    ref,
    () => ({
      open: (data?) => {
        setIsOpen(true);
      },
      close: () => {
        setIsOpen(false);
      },
    }),
    [],
  );

  const isDetail = !!initialData?.name;
  const canEditAll = !isDetail || canEdit;

  useEffect(() => {
    if (isOpen && initialData) {
      formRef.current?.reset(initialData);
      setCanEdit(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    controlledOnClose?.();
  }, [controlledOnClose]);

  const onSubmit = (data: EventFormData) => {
    // TODO: dispatch to store
    console.log(data);
    handleClose();
  };

  const headerTitle = isDetail ? (initialData?.name ?? '') : 'New Event';

  return (
    <Form
      ref={formRef}
      schema={eventModalSchema}
      defaultValues={initialData}
      onSubmit={onSubmit}
      id={FORM_ID}>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        header={
          <>
            <CalendarDays size={20} className='text-primary shrink-0' />
            <h2 className='flex-1 text-headline-md text-on-surface'>{headerTitle}</h2>
            {isDetail && (
              <button
                type='button'
                onClick={() => setCanEdit(true)}
                className='p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors'>
                <Pencil size={16} />
              </button>
            )}
          </>
        }
        footer={
          <div className='flex justify-end w-full'>
            <ButtonRHF form={FORM_ID} variant='primary'>
              Save Changes
            </ButtonRHF>
          </div>
        }>
        <EventFields canEditAll={canEditAll} />
      </Modal>
    </Form>
  );
});
