import { Navigate } from 'react-router-dom';
import { useAppSelector } from 'app/store';
import { Logo } from 'app/components/atoms/Logo';
import { AuthPageFooter } from 'app/components/molecules/AuthPageFooter';
import { ROUTES } from 'app/constants/route';
import { RegisterForm } from './RegisterForm';

export function RegisterPage() {
  const { user, isAnonymous } = useAppSelector((s) => s.auth);

  if (user || isAnonymous) return <Navigate to={ROUTES.MONTH} replace />;

  return (
    <div className='min-h-screen bg-background flex flex-col items-center justify-center p-4'>
      <div className='w-full max-w-96 flex flex-col gap-8'>
        <div className='flex flex-col items-center gap-2 text-center'>
          <Logo />
          <p className='text-body-md text-on-surface-variant'>
            Create your account to start managing
            <br />
            events and never miss a start time.
          </p>
        </div>

        <div className='bg-surface-container-lowest rounded-2xl shadow-lg overflow-hidden border border-outline-variant'>
          <RegisterForm />
        </div>

        <AuthPageFooter />
      </div>
    </div>
  );
}
