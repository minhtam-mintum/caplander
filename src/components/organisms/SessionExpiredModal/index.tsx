import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'app/components/atoms/Button';
import { Modal } from 'app/components/molecules/Modal';
import { ROUTES } from 'app/constants/route';
import { useAppDispatch } from 'app/store';
import { logout } from 'app/store/slices/authSlice';

export function SessionExpiredModal() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleConfirm = useCallback(() => {
    dispatch(logout());
    navigate(ROUTES.LOGIN, { replace: true });
  }, [dispatch, navigate]);

  return (
    <Modal
      initiallyOpen
      dismissible={false}
      ariaLabel='Session expired'
      dialogRole='alertdialog'
      className='max-w-[28rem] border-t-4 border-error'
      render={(renderHeader, renderFooter) => (
        <>
          {renderHeader(
            <h2 className='flex-1 text-headline-md text-on-surface'>Session expired</h2>,
          )}
          <div className='px-6 py-5'>
            <p className='m-0 text-body-md text-on-surface-variant'>
              Your login session has expired. Sign in again to continue.
            </p>
          </div>
          {renderFooter(
            <div className='flex justify-end'>
              <Button
                type='button'
                variant='primary'
                className='min-w-24 justify-center active:scale-[0.98]'
                onClick={handleConfirm}
                autoFocus
              >
                OK
              </Button>
            </div>,
          )}
        </>
      )}
    />
  );
}
