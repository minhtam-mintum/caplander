import { useCallback } from 'react';
import { LogOut, UserCircle, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GhostButton } from 'app/components/molecules/Buttons/GhostButton';
import { ROUTES } from 'app/constants/route';
import { apiLogout } from 'app/services/api';
import { useAppDispatch, useAppSelector } from 'app/store';
import { logout } from 'app/store/slices/authSlice';

interface IUserDropdownProps {
  onClose: () => void;
}

export function UserDropdown({ onClose }: IUserDropdownProps) {
  const dispatch = useAppDispatch();
  const { user, isAnonymous, refreshToken } = useAppSelector((s) => s.auth);

  const handleLogout = useCallback(async () => {
    const token = refreshToken;
    if (token) {
      try {
        await apiLogout(token);
      } catch {
        // Local logout should still happen if the server session is already gone.
      }
    }
    dispatch(logout());
    onClose();
  }, [dispatch, onClose, refreshToken]);

  const handleSignIn = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
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
          <GhostButton
            className='w-full! justify-start gap-2.5! rounded-none! px-4! py-2.5! text-body-sm! hover:bg-surface-container-high!'
            onClick={handleLogout}>
            <LogOut size={15} className='text-on-surface-variant' />
            Sign Out
          </GhostButton>
        </>
      ) : isAnonymous ? (
        <>
          <div className='px-4 py-2.5 border-b border-outline-variant'>
            <p className='text-label-sm text-on-surface-variant'>Guest mode</p>
            <p className='text-label-xs text-on-surface-variant'>Data is local only</p>
          </div>
          <GhostButton
            className='w-full! justify-start gap-2.5! rounded-none! px-4! py-2.5! text-body-sm! hover:bg-surface-container-high!'
            onClick={handleSignIn}>
            <UserCircle size={15} className='text-on-surface-variant' />
            Sign In
          </GhostButton>
        </>
      ) : null}
    </div>
  );
}
