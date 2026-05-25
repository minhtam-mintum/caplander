import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { DismissButton } from 'app/components/molecules/Buttons/DismissButton';
import { cn } from 'app/utils/cn';
import { lockScroll, unlockScroll } from 'app/utils/scrollLock';

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, children, className, header, footer }: IModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      lockScroll();
      return unlockScroll;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={onClose} />
      <div className={cn('relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-2xl', className)}>
        {header && (
          <>
            <div className='flex items-center gap-3 px-6 py-5'>
              {header}
              <DismissButton type='button' onClick={onClose}>
                <X size={18} />
              </DismissButton>
            </div>
            <div className='h-px bg-outline-variant' />
          </>
        )}
        {children}
        {footer && (
          <>
            <div className='h-px bg-outline-variant' />
            <div className='px-6 py-4'>{footer}</div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
