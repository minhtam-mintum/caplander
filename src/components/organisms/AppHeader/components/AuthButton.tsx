import { useCallback, useEffect, useRef, useState } from 'react';
import { LogOut, UserCircle, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'app/store';
import { logout } from 'app/store/slices/authSlice';
import { apiLogout } from 'app/services/api';
import { Avatar } from 'app/components/atoms/Avatar';
import { ROUTES } from 'app/constants/route';

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function UserDropdown({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const { user, isAnonymous, refreshToken } = useAppSelector((s) => s.auth);

  const handleLogout = useCallback(async () => {
    const token = refreshToken;
    if (token) {
      try {
        await apiLogout(token);
      } catch {}
    }
    dispatch(logout());
    onClose();
  }, [dispatch, onClose, refreshToken]);

  const handleSignIn = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <>
      <div className='absolute right-0 top-full mt-1.5 z-20 bg-surface-container rounded-xl shadow-lg border border-outline-variant min-w-44 py-1 overflow-hidden'>
        {user ? (
          <>
            <div className='px-4 py-2.5 border-b border-outline-variant'>
              <p className='text-label-sm text-on-surface-variant'>Signed in as</p>
              <p className='text-body-sm font-medium text-on-surface truncate'>{user.name}</p>
              <p className='text-label-sm text-on-surface-variant truncate'>@{user.userId}</p>
            </div>
            <Link
              to={ROUTES.PROFILE}
              onClick={onClose}
              className='w-full flex items-center gap-2.5 px-4 py-2.5 text-body-sm text-on-surface hover:bg-surface-container-high transition-colors'>
              <UserRound size={15} className='text-on-surface-variant' />
              Profile
            </Link>
            <button
              className='w-full flex items-center gap-2.5 px-4 py-2.5 text-body-sm text-on-surface hover:bg-surface-container-high transition-colors'
              onClick={handleLogout}>
              <LogOut size={15} className='text-on-surface-variant' />
              Sign Out
            </button>
          </>
        ) : isAnonymous ? (
          <>
            <div className='px-4 py-2.5 border-b border-outline-variant'>
              <p className='text-label-sm text-on-surface-variant'>Guest mode</p>
              <p className='text-label-xs text-on-surface-variant'>Data is local only</p>
            </div>
            <button
              className='w-full flex items-center gap-2.5 px-4 py-2.5 text-body-sm text-on-surface hover:bg-surface-container-high transition-colors'
              onClick={handleSignIn}>
              <UserCircle size={15} className='text-on-surface-variant' />
              Sign In
            </button>
          </>
        ) : null}
      </div>
    </>
  );
}

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
      <button onClick={() => setIsOpen((v) => !v)} aria-label='Account menu' aria-expanded={isOpen}>
        <Avatar initials={initials} />
      </button>
      {isOpen && <UserDropdown onClose={() => setIsOpen(false)} />}
    </div>
  );
}
