import { useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'app/store';
import { setAnonymous } from 'app/store/slices/authSlice';
import { Logo } from 'app/components/atoms/Logo';
import { type IModalHandle } from 'app/components/molecules/Modal';
import { AuthPageFooter } from 'app/components/molecules/AuthPageFooter';
import { ROUTES } from 'app/constants/route';
import { AnonymousConfirmModal } from './AnonymousConfirmModal';
import { LoginForm } from './LoginForm';

export function LoginPage() {
  const { user, isAnonymous } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const anonModalRef = useRef<IModalHandle>(null);

  if (user || isAnonymous) return <Navigate to={ROUTES.MONTH} replace />;

  const handleAnonymousConfirm = () => {
    dispatch(setAnonymous());
    navigate(ROUTES.MONTH, { replace: true });
  };

  return (
    <>
      <AnonymousConfirmModal ref={anonModalRef} onConfirm={handleAnonymousConfirm} />
      <div className='min-h-screen bg-background flex flex-col items-center justify-center p-4'>
        <div className='w-full max-w-96 flex flex-col gap-8'>
          <div className='flex flex-col items-center gap-2 text-center'>
            <Logo />
            <p className='text-body-md text-on-surface-variant'>
              Sign in to manage your events and get
              <br />
              notified the moment they start.
            </p>
          </div>

          <div className='bg-surface-container-lowest rounded-2xl shadow-lg overflow-hidden border border-outline-variant'>
            <LoginForm onGuestClick={() => anonModalRef.current?.open()} />
          </div>

          <AuthPageFooter />
        </div>
      </div>
    </>
  );
}
