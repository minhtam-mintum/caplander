import type { ReactNode } from 'react';
import { Bell, Clock, Pencil, Tag, Trash2 } from 'lucide-react';
import { formatDetailDate, formatTime } from 'app/utils/calendar';
import { OutlineButton } from 'app/components/molecules/Buttons/OutlineButton';
import { ALERT_OPTIONS, type EventFormData } from 'app/components/organisms/EventModal/const';
import { useAppSelector } from 'app/store';

interface IEventDetailProps {
  data: Partial<EventFormData>;
  renderFooter: (content: ReactNode) => ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}

export function EventDetail({ data, renderFooter, onEdit, onDelete }: IEventDetailProps) {
  const { startDate, startTime, endDate, endTime, label, labelName, labelColor, alert, notes } =
    data;
  const matchingLabel = useAppSelector((state) =>
    label ? state.labels.items.find((item) => item.value === label) : undefined,
  );
  const resolvedLabelName = labelName ?? matchingLabel?.name;
  const resolvedLabelColor = labelColor ?? matchingLabel?.color;

  const alertOption = ALERT_OPTIONS.find((o) => 'value' in o && o.value === alert);

  const sameDay =
    startDate instanceof Date &&
    endDate instanceof Date &&
    startDate.getTime() === endDate.getTime();

  return (
    <div className='flex flex-col flex-1 min-h-0'>
      <div className='px-6 py-5 flex flex-col gap-6 overflow-y-auto flex-1'>
        {/* Time & date */}
        <div className='flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3'>
          <Clock size={18} className='text-primary shrink-0' />
          <p className='text-body-md font-semibold text-on-surface'>
            {startDate instanceof Date &&
              endDate instanceof Date &&
              (sameDay ? (
                <>
                  {formatTime(startTime ?? 0)} {formatDetailDate(startDate)}{' '}
                  <span className='text-on-surface-variant font-normal'>—</span>{' '}
                  {formatTime(endTime ?? 0)}
                </>
              ) : (
                <>
                  {formatTime(startTime ?? 0)} {formatDetailDate(startDate)}{' '}
                  <span className='text-on-surface-variant font-normal'>—</span>{' '}
                  {formatTime(endTime ?? 0)} {formatDetailDate(endDate)}
                </>
              ))}
          </p>
        </div>

        {/* Label + Alert */}
        <div className='grid grid-cols-2 gap-4'>
          {resolvedLabelName && (
            <div className='flex flex-col gap-1.5'>
              <span className='text-label-sm uppercase tracking-widest text-on-surface-variant'>
                Label
              </span>
              <div className='flex items-center gap-2'>
                <Tag size={13} style={{ color: resolvedLabelColor }} className='shrink-0' />
                <span className='text-body-sm font-medium text-on-surface'>{resolvedLabelName}</span>
              </div>
            </div>
          )}

          {alertOption && 'option' in alertOption && (
            <div className='flex flex-col gap-1.5'>
              <span className='text-label-sm uppercase tracking-widest text-on-surface-variant'>
                Alert
              </span>
              <div className='flex items-center gap-2'>
                <Bell size={14} className='text-on-surface-variant shrink-0' />
                <span className='text-body-sm font-medium text-on-surface'>
                  {alertOption.option}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        {notes && (
          <div className='flex flex-col gap-2'>
            <span className='text-label-sm uppercase tracking-widest text-on-surface-variant'>
              Notes
            </span>
            <div
              className='text-body-md text-on-surface bg-surface-container rounded-xl px-4 py-3 [&_p:last-child]:mb-0 [&_p]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4'
              dangerouslySetInnerHTML={{ __html: notes }}
            />
          </div>
        )}
      </div>
      {renderFooter(
        <div className='flex justify-end gap-2'>
          <OutlineButton
            type='button'
            className='bg-error! text-on-error! border-error! hover:bg-error/90!'
            onClick={onDelete}>
            <Trash2 size={14} />
            Delete
          </OutlineButton>
          <OutlineButton type='button' onClick={onEdit}>
            <Pencil size={14} />
            Edit
          </OutlineButton>
        </div>,
      )}
    </div>
  );
}
