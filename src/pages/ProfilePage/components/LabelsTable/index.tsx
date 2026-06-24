import { useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useAppDispatch } from 'app/store';
import { useLabels } from 'app/hooks/useLabels';
import { addLabelThunk, deleteLabelThunk, updateLabelThunk } from 'app/store/slices/labelSlice';
import { LabelRow } from './LabelRow';
import { NewLabelRow } from './NewLabelRow';

function LabelsTable() {
  const dispatch = useAppDispatch();
  const { labels, isLoading } = useLabels();

  const handleSave = useCallback(
    async (id: string, name: string, color: string) => {
      await dispatch(updateLabelThunk({ id, name, color }));
    },
    [dispatch],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await dispatch(deleteLabelThunk(id));
    },
    [dispatch],
  );

  const handleAdd = useCallback(
    async (name: string, color: string) => {
      await dispatch(addLabelThunk({ name, color }));
    },
    [dispatch],
  );

  return (
    <div className='bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden'>
      <div className='px-6 py-4 border-b border-outline-variant'>
        <h2 className='text-title-sm font-medium text-on-surface'>Labels</h2>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full table-fixed'>
          <thead>
            <tr className='border-b border-outline-variant'>
              <th className='px-6 py-3 w-1/2 text-left text-label-xs font-semibold text-on-surface-variant uppercase tracking-wider'>
                Name
              </th>
              <th className='px-6 py-3 w-1/4 text-center text-label-xs font-semibold text-on-surface-variant uppercase tracking-wider'>
                Color
              </th>
              <th className='px-6 py-3 w-1/4 text-right text-label-xs font-semibold text-on-surface-variant uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className='px-6 py-8 text-center text-on-surface-variant'>
                  <Loader2 size={20} className='animate-spin mx-auto' />
                </td>
              </tr>
            ) : labels.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className='px-6 py-8 text-center text-body-sm text-on-surface-variant'>
                  No labels yet
                </td>
              </tr>
            ) : (
              labels.map((label) => (
                <LabelRow
                  key={label._id}
                  label={label}
                  onSave={handleSave}
                  onDelete={handleDelete}
                />
              ))
            )}
            <NewLabelRow onAdd={handleAdd} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default LabelsTable;
