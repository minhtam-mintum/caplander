import { Bell, Clock, Pencil, Tag } from 'lucide-react';
import { useLabels } from 'app/hooks/useLabels';
import { OutlineButton } from 'app/components/molecules/Buttons/OutlineButton';
import { formatDetailDate, formatTime } from 'app/utils/calendar';
import { ALERT_OPTIONS, type EventFormData } from './const';

interface IEventDetailProps {
  onEdit: () => void;
  data: Partial<EventFormData>;
}

export function EventDetail({ onEdit, data }: IEventDetailProps) {
  const { labels } = useLabels();

  const { startDate, startTime, endDate, endTime, label, alert, notes } = data;

  const alertOption = ALERT_OPTIONS.find((o) => 'value' in o && o.value === alert);
  const labelData = labels.find((l) => l.value === label);

  const sameDay =
    startDate instanceof Date &&
    endDate instanceof Date &&
    startDate.getTime() === endDate.getTime();

  return (
    <div className='px-6 py-5 flex flex-col gap-6'>
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
        {labelData && (
          <div className='flex flex-col gap-1.5'>
            <span className='text-label-sm uppercase tracking-widest text-on-surface-variant'>
              Label
            </span>
            <div className='flex items-center gap-2'>
              <Tag size={13} style={{ color: labelData.color }} className='shrink-0' />
              <span className='text-body-sm font-medium text-on-surface'>{labelData.name}</span>
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
              <span className='text-body-sm font-medium text-on-surface'>{alertOption.option}</span>
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

      <OutlineButton type='button' onClick={onEdit}>
        <Pencil size={14} />
        Edit
      </OutlineButton>
    </div>
  );
}
