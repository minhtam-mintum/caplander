import { useEffect, useRef, useState } from 'react';
import { Avatar } from 'app/components/atoms/Avatar';
import { IconButton } from 'app/components/molecules/Buttons/IconButton';
import { UserDropdown } from 'app/components/organisms/AppHeader/components/UserDropdown';
import { useAppSelector } from 'app/store';
import { getInitials } from '../utils';

export function AuthButton() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen]);

  const initials = user ? getInitials(user.name) : '?';

  return (
    <div ref={containerRef} className='relative'>
      <IconButton
        className='p-0!'
        onClick={() => setIsOpen((v) => !v)}
        aria-label='Account menu'
        aria-expanded={isOpen}>
        <Avatar initials={initials} />
      </IconButton>
      {isOpen && <UserDropdown onClose={() => setIsOpen(false)} />}
    </div>
  );
}
