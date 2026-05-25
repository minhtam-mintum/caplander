import * as yup from 'yup';
import { Tag } from 'lucide-react';
import type { SelectItem } from 'app/components/molecules/Selects/SelectRHF';
import type { ILabel } from 'app/hooks/useLabels';
import { CreateNewLabel } from '../components/CreateNewLabel';

// ─── Schema ──────────────────────────────────────────────────────────────────

export const ALERT_VALUES = [
  0, 300000, 600000, 900000, 1800000, 3600000, 7200000, 86400000, 172800000, 604800000,
] as const;

export type AlertValue = (typeof ALERT_VALUES)[number];

export const eventModalSchema = yup.object({
  name: yup.string().required('Name is required'),
  startDate: yup.date().required('Start date is required'),
  startTime: yup.number().required('Start time is required'),
  endDate: yup
    .date()
    .required('End date is required')
    .test('end-date-not-before-start', 'End date must be on or after start date', function (val) {
      const { startDate } = this.parent as { startDate: Date };
      if (!startDate || !val) return true;
      return val.getTime() >= startDate.getTime();
    }),
  endTime: yup
    .number()
    .required('End time is required')
    .test('end-after-start', 'End must be after start', function (val) {
      const { startDate, startTime, endDate } = this.parent as {
        startDate: Date;
        startTime: number;
        endDate: Date;
      };
      if (!startDate || startTime == null || !endDate || val == null) return true;
      return endDate.getTime() + val > startDate.getTime() + startTime;
    }),
  alert: yup
    .number()
    .oneOf([...ALERT_VALUES])
    .required('Alert is a required field'),
  label: yup.string().required('Label is a required field'),
  notes: yup.string().default(''),
});

export type EventFormData = yup.InferType<typeof eventModalSchema>;

// ─── Label options ────────────────────────────────────────────────────────────

export function buildLabelOptions(
  labels: ILabel[],
  onAdd: (label: ILabel) => void,
): SelectItem[] {
  return [
    ...labels.map((l) => ({
      option: (
        <span className='flex items-center gap-2'>
          <Tag size={12} style={{ color: l.color }} />
          {l.name}
        </span>
      ),
      value: l.value,
    })),
    { custom: <CreateNewLabel onAdd={onAdd} /> },
  ];
}

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
