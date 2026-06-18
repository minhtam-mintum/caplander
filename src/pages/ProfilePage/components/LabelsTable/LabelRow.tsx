import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, Pencil, Trash2, X } from 'lucide-react';
import { type ILabel } from 'app/hooks/useLabels';
import { Input } from 'app/components/atoms/Input';
import { IconButton } from 'app/components/molecules/Buttons/IconButton';
import { ColorPicker } from 'app/components/molecules/ColorPicker';

interface ILabelRowProps {
  label: ILabel;
  onSave: (id: string, name: string, color: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function LabelRow({ label, onSave, onDelete }: ILabelRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(label.name);
  const [color, setColor] = useState(label.color);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleEdit = () => {
    setName(label.name);
    setColor(label.color);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setName(label.name);
    setColor(label.color);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setIsSaving(true);
    try {
      await onSave(label._id, trimmed, color);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(label._id);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <tr className='border-b border-outline-variant'>
        <td className='px-6 py-3'>
          <Input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
        </td>
        <td className='px-6 py-3 text-center'>
          <ColorPicker selected={color} onChange={setColor} disabled={isSaving} />
        </td>
        <td className='px-6 py-3'>
          <div className='flex items-center justify-end gap-1'>
            <IconButton
              onClick={() => void handleSave()}
              disabled={isSaving}
              className='text-primary hover:text-primary/80'>
              {isSaving ? <Loader2 size={15} className='animate-spin' /> : <Check size={15} />}
            </IconButton>
            <IconButton onClick={handleCancel} disabled={isSaving}>
              <X size={15} />
            </IconButton>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className='border-b border-outline-variant hover:bg-surface-container-high transition-colors'>
      <td className='px-6 py-3'>
        <div className='w-full px-3 py-1.5 text-body-md text-on-surface'>{label.name}</div>
      </td>
      <td className='px-6 py-3 text-center'>
        <span className='inline-block w-5 h-5 rounded-full' style={{ background: label.color }} />
      </td>
      <td className='px-6 py-3'>
        <div className='flex items-center justify-end gap-1'>
          <IconButton onClick={handleEdit}>
            <Pencil size={15} />
          </IconButton>
          <IconButton
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className='hover:text-error'>
            {isDeleting ? <Loader2 size={15} className='animate-spin' /> : <Trash2 size={15} />}
          </IconButton>
        </div>
      </td>
    </tr>
  );
}

export { LabelRow };
