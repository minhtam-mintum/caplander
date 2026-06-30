import { forwardRef, type ReactNode, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { createPortal } from 'react-dom';
import { DismissButton } from 'app/components/molecules/Buttons/DismissButton';
import { cn } from 'app/utils/cn';
import { lockScroll, unlockScroll } from 'app/utils/scrollLock';

export interface IModalHandle {
  open: () => void;
  close: () => void;
}

interface IModalProps {
  onClose?: () => void;
  render: (
    renderHeader: (content: ReactNode) => ReactNode,
    renderFooter: (content: ReactNode) => ReactNode,
  ) => ReactNode;
  className?: string;
  dismissible?: boolean;
  initiallyOpen?: boolean;
  ariaLabel?: string;
  dialogRole?: 'dialog' | 'alertdialog';
}

export const Modal = forwardRef<IModalHandle, IModalProps>(function Modal(
  {
    onClose,
    render,
    className,
    dismissible = true,
    initiallyOpen = false,
    ariaLabel,
    dialogRole = 'dialog',
  },
  ref,
) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }), []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || !dismissible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dismissible, isOpen, handleClose]);

  useEffect(() => {
    if (isOpen) {
      lockScroll();
      return unlockScroll;
    }
  }, [isOpen]);

  const renderHeader = useCallback((content: ReactNode) => (
    <>
      <div className='flex items-center gap-3 px-6 py-5'>
        {content}
        {dismissible && <DismissButton onClick={handleClose} />}
      </div>
      <div className='h-px bg-outline-variant' />
    </>
  ), [dismissible, handleClose]);

  const renderFooter = useCallback((content: ReactNode) => (
    <>
      <div className='h-px bg-outline-variant' />
      <div className='px-6 py-4'>{content}</div>
    </>
  ), []);

  if (!isOpen) return null;

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm'
        onClick={dismissible ? handleClose : undefined}
      />
      <div
        role={dialogRole}
        aria-modal='true'
        aria-label={ariaLabel}
        className={cn('relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[calc(100dvh-2rem)]', className)}
      >
        {render(renderHeader, renderFooter)}
      </div>
    </div>,
    document.body,
  );
});
