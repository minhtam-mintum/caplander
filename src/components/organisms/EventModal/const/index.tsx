import * as yup from 'yup';
import { Tag } from 'lucide-react';
import type { SelectItem } from 'app/components/molecules/Selects/SelectRHF';
import { CreateNewLabel } from '../components/CreateNewLabel';

// ─── Schema ──────────────────────────────────────────────────────────────────

export const ALERT_VALUES = [
  0, 300000, 600000, 900000, 1800000, 3600000, 7200000, 86400000, 172800000, 604800000,
] as const;

export type AlertValue = (typeof ALERT_VALUES)[number];

export const eventModalSchema = yup.object({
  name: yup.string().required('Name is required'),
  startDate: yup.string().required('Start date is required'),
  startTime: yup.string().required('Start time is required'),
  endDate: yup
    .string()
    .required('End date is required')
    .test('end-date-not-before-start', 'End date must be on or after start date', function (val) {
      const { startDate } = this.parent as { startDate: string };
      if (!startDate || !val) return true;
      return val >= startDate;
    }),
  endTime: yup
    .string()
    .required('End time is required')
    .test('end-after-start', 'End must be after start', function (val) {
      const { startDate, startTime, endDate } = this.parent as {
        startDate: string;
        startTime: string;
        endDate: string;
      };
      if (!startDate || !startTime || !endDate || !val) return true;
      return endDate > startDate || (endDate === startDate && val > startTime);
    }),
  alert: yup
    .number()
    .oneOf([...ALERT_VALUES])
    .required(),
  label: yup.string().required(),
  notes: yup.string().default(''),
});

export type EventFormData = yup.InferType<typeof eventModalSchema>;

// ─── Label options ────────────────────────────────────────────────────────────

export const LABEL_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];

export function getLabelColor(label: string): string {
  const hash = label.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return LABEL_COLORS[hash % LABEL_COLORS.length];
}

export const LABEL_OPTIONS: SelectItem[] = [
  ...['Work', 'Personal', 'Health', 'Learning', 'Other'].map((l) => ({
    option: (
      <span className='flex items-center gap-2'>
        <Tag size={12} style={{ color: getLabelColor(l) }} />
        {l}
      </span>
    ),
    value: l.toLowerCase(),
  })),
  { custom: <CreateNewLabel /> },
];

// ─── Alert options ────────────────────────────────────────────────────────────

export const ALERT_OPTIONS: SelectItem[] = [
  { value: 0, option: 'At time of event' },
  { value: 300000, option: '5 minutes before' },
  { value: 600000, option: '10 minutes before' },
  { value: 900000, option: '15 minutes before' },
  { value: 1800000, option: '30 minutes before' },
  { value: 3600000, option: '1 hour before' },
  { value: 7200000, option: '2 hours before' },
  { value: 86400000, option: '1 day before' },
  { value: 172800000, option: '2 days before' },
  { value: 604800000, option: '1 week before' },
];
