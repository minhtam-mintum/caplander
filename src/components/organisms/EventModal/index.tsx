import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Modal, type IModalHandle } from 'app/components/molecules/Modal';
import { type EventFormData } from './const';
import { EventFields } from './components/EventFields';
import { EventDetail } from './components/EventDetail';
import { ConfirmDelete } from './components/ConfirmDelete';

export type { EventFormData } from './const';

type EventModalView = 'form' | 'detail' | 'confirm-delete';

export interface IEventModalHandle {
  open: (initialData?: Partial<EventFormData>) => void;
  close: () => void;
}

interface IEventModalProps {}

export const EventModal = forwardRef<IEventModalHandle, IEventModalProps>(function EventModal(
  {},
  ref,
) {
  const [view, setView] = useState<EventModalView>('form');
  const modalRef = useRef<IModalHandle>(null);
  const dataRef = useRef<Partial<EventFormData>>({});
  useImperativeHandle(
    ref,
    () => ({
      open: (data) => {
        setView(data?.id ? 'detail' : 'form');
        modalRef.current?.open();
        dataRef.current = data ?? {};
      },
      close: () => {
        modalRef.current?.close();
      },
    }),
    [],
  );

  const id = dataRef.current.id;
  const headerTitle =
    view === 'form' ? (id ? 'Update Event' : 'New Event') : (dataRef.current.name ?? '');

  return (
    <Modal
      ref={modalRef}
      render={(renderHeader, renderFooter) => (
        <>
          {renderHeader(
            <>
              <CalendarDays size={20} className='text-primary shrink-0' />
              <h2 className='flex-1 text-headline-md text-on-surface'>{headerTitle}</h2>
            </>,
          )}
          {view === 'form' && (
            <EventFields
              renderFooter={renderFooter}
              defaultValues={dataRef.current}
              id={id}
              onCancel={() => setView('detail')}
              onClose={() => modalRef.current?.close()}
            />
          )}
          {view === 'detail' && (
            <EventDetail
              data={dataRef.current}
              renderFooter={renderFooter}
              onEdit={() => setView('form')}
              onDelete={() => setView('confirm-delete')}
            />
          )}
          {view === 'confirm-delete' && (
            <ConfirmDelete
              renderFooter={renderFooter}
              id={dataRef.current.id!}
              onCancel={() => setView('detail')}
              onClose={() => modalRef.current?.close()}
            />
          )}
        </>
      )}
    />
  );
});
