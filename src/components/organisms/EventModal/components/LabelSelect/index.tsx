import { Tag } from 'lucide-react';
import { SelectRHF } from 'app/components/molecules/Selects/SelectRHF';
import { useLabels } from 'app/hooks/useLabels';
import { buildLabelOptions } from '../../const';

interface ILabelSelectProps {
  disabled?: boolean;
}

export function LabelSelect({ disabled }: ILabelSelectProps) {
  const { labels, addLabel } = useLabels();
  return (
    <SelectRHF
      name='label'
      label='Label'
      options={buildLabelOptions(labels, addLabel)}
      icon={<Tag size={15} />}
      disabled={disabled}
    />
  );
}
