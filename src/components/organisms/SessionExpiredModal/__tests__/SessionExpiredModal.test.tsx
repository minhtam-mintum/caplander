import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { SessionExpiredModal } from 'app/components/organisms/SessionExpiredModal';
import { renderWithProviders } from 'app/test/utils';

describe('SessionExpiredModal', () => {
  it('navigates to login and acknowledges the expired session when OK is clicked', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(
      <Routes>
        <Route path='/month' element={<SessionExpiredModal />} />
        <Route path='/login' element={<p>Login page</p>} />
      </Routes>,
      {
        initialRoute: '/month',
        preloadedState: {
          auth: {
            user: null,
            accessToken: null,
            refreshToken: null,
            isAnonymous: false,
            sessionExpired: true,
          },
        },
      },
    );

    const dialog = screen.getByRole('alertdialog', { name: 'Session expired' });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveClass('w-full', 'max-w-[28rem]');

    await user.click(screen.getByRole('button', { name: 'OK' }));

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(store.getState().auth.sessionExpired).toBe(false);
  });
});
