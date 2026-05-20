import { useState } from 'react';
import {
  Bold,
  CalendarDays,
  Clock,
  Italic,
  Link2,
  List,
  Pencil,
  Plus,
  Tag,
  X,
} from 'lucide-react';
import { Button } from 'app/components/atoms/Button';
import { Modal } from 'app/components/molecules/Modal';
import { cn } from 'app/utils/cn';

type EventStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';

const STATUS_OPTIONS: { value: EventStatus; label: string; color: string }[] = [
  { value: 'todo',       label: 'To Do',       color: 'bg-outline' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-primary' },
  { value: 'done',       label: 'Done',        color: 'bg-tertiary-container' },
  { value: 'cancelled',  label: 'Cancelled',   color: 'bg-error' },
];

const LABEL_OPTIONS = ['Work', 'Personal', 'Health', 'Learning', 'Other'];

export interface EventFormData {
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  status: EventStatus;
  label: string;
  notes: string;
}

interface IEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<EventFormData>;
  onSave: (data: EventFormData) => void;
}

function formatTimeDisplay(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const suffix = h < 12 ? 'AM' : 'PM';
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}:00 ${suffix}` : `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function EventModal({ isOpen, onClose, initialData, onSave }: IEventModalProps) {
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState<EventFormData>({
    title:     initialData?.title     ?? 'New Event',
    startTime: initialData?.startTime ?? '10:00',
    endTime:   initialData?.endTime   ?? '11:00',
    date:      initialData?.date      ?? today,
    status:    initialData?.status    ?? 'in_progress',
    label:     initialData?.label     ?? 'Work',
    notes:     initialData?.notes     ?? '',
  });

  const [editingTitle, setEditingTitle] = useState(false);

  const set = <K extends keyof EventFormData>(key: K, value: EventFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const activeStatus = STATUS_OPTIONS.find((s) => s.value === form.status) ?? STATUS_OPTIONS[1];

  function handleSave() {
    onSave(form);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className='flex items-center gap-3 px-6 py-5'>
        <CalendarDays size={20} className='text-primary shrink-0' />
        {editingTitle ? (
          <input
            autoFocus
            className='flex-1 text-headline-md text-on-surface bg-transparent outline-none border-b border-primary'
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => { if (e.key === 'Enter') setEditingTitle(false); }}
          />
        ) : (
          <h2 className='flex-1 text-headline-md text-on-surface'>{form.title}</h2>
        )}
        <button
          onClick={() => setEditingTitle(true)}
          className='p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors'
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={onClose}
          className='p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors'
        >
          <X size={18} />
        </button>
      </div>

      <div className='h-px bg-outline-variant' />

      {/* Body */}
      <div className='px-6 py-5 flex flex-col gap-5'>
        {/* Time & Date row */}
        <div className='grid grid-cols-2 gap-3'>
          <div className='flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3'>
            <Clock size={16} className='text-on-surface-variant shrink-0' />
            <div className='flex items-center gap-1.5 text-body-md text-on-surface'>
              <input
                type='time'
                value={form.startTime}
                onChange={(e) => set('startTime', e.target.value)}
                className='bg-transparent outline-none w-24 text-body-md text-on-surface'
              />
              <span className='text-on-surface-variant'>-</span>
              <input
                type='time'
                value={form.endTime}
                onChange={(e) => set('endTime', e.target.value)}
                className='bg-transparent outline-none w-24 text-body-md text-on-surface'
              />
            </div>
          </div>

          <div className='flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3'>
            <CalendarDays size={16} className='text-on-surface-variant shrink-0' />
            <input
              type='date'
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className='flex-1 bg-transparent outline-none text-body-md text-on-surface'
            />
            <span className='text-body-md text-on-surface pointer-events-none select-none hidden sm:block'>
              {formatDateDisplay(form.date)}
            </span>
          </div>
        </div>

        {/* Status & Label row */}
        <div className='grid grid-cols-2 gap-3'>
          <div className='relative'>
            <div className='flex items-center gap-3 bg-primary-fixed/30 rounded-xl px-4 py-3'>
              <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', activeStatus.color)} />
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value as EventStatus)}
                className='flex-1 bg-transparent outline-none text-body-md text-on-surface appearance-none cursor-pointer'
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className='flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3'>
            <Tag size={15} className='text-on-surface-variant shrink-0' />
            <select
              value={form.label}
              onChange={(e) => set('label', e.target.value)}
              className='flex-1 bg-transparent outline-none text-body-md text-on-surface appearance-none cursor-pointer'
            >
              {LABEL_OPTIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className='flex flex-col gap-2'>
          <span className='text-label-md text-on-surface-variant uppercase tracking-widest'>Notes</span>
          <div className='border border-outline-variant rounded-xl overflow-hidden'>
            {/* Toolbar */}
            <div className='flex items-center gap-0.5 px-3 py-2 border-b border-outline-variant bg-surface-container-low'>
              {[
                { Icon: Bold,   title: 'Bold' },
                { Icon: Italic, title: 'Italic' },
                { Icon: List,   title: 'List' },
                { Icon: Link2,  title: 'Link' },
              ].map(({ Icon, title }) => (
                <button
                  key={title}
                  title={title}
                  className='p-1.5 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors'
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
            {/* Editor */}
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder='Add notes…'
              rows={5}
              className='w-full px-4 py-3 text-body-md text-on-surface bg-transparent outline-none resize-none placeholder:text-on-surface-variant/50'
            />
          </div>
        </div>
      </div>

      <div className='h-px bg-outline-variant' />

      {/* Footer */}
      <div className='flex items-center justify-between px-6 py-4'>
        <button className='flex items-center gap-1.5 text-body-md text-primary hover:text-primary/80 transition-colors'>
          <Plus size={15} />
          Create New Label
        </button>
        <div className='flex items-center gap-3'>
          <Button variant='secondary' onClick={onClose}>Cancel</Button>
          <Button variant='primary' onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </Modal>
  );
}
