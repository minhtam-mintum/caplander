import type { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { CancelButton } from 'app/components/molecules/Buttons/CancelButton';
import { OutlineButton } from 'app/components/molecules/Buttons/OutlineButton';
import { useAppDispatch } from 'app/store';
import { removeEvent } from 'app/store/slices/eventSlice';

interface IConfirmDeleteProps {
  renderFooter: (content: ReactNode) => ReactNode;
  id: string;
  onCancel: () => void;
  onClose: () => void;
}

export function ConfirmDelete({ renderFooter, id, onCancel, onClose }: IConfirmDeleteProps) {
  const dispatch = useAppDispatch();

  const handleDelete = () => {
    dispatch(removeEvent(id));
    onClose();
  };
  return (
    <>
      <div className='px-6 py-5'>
        <p className='text-body-md text-on-surface-variant'>
          This event will be permanently deleted. This action cannot be undone.
        </p>
      </div>
      {renderFooter(
        <div className='flex justify-end gap-2'>
          <CancelButton type='button' onClick={onCancel}>
            Cancel
          </CancelButton>
          <OutlineButton
            type='button'
            className='bg-error! text-on-error! border-error! hover:bg-error/90!'
            onClick={handleDelete}>
            <Trash2 size={14} />
            Delete
          </OutlineButton>
        </div>,
      )}
    </>
  );
}
