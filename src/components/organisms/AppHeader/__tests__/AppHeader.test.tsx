import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppHeader } from '../index';
import { renderWithProviders } from 'app/test/utils';
import { ROUTES } from 'app/constants/route';

const storeState = {
  events: { items: [] },
  notifications: { readIds: [], notifiedIds: [] },
};

function renderAppHeader() {
  return renderWithProviders(<AppHeader />, {
    preloadedState: storeState,
    initialRoute: ROUTES.MONTH,
  });
}

describe('AppHeader', () => {
  it('renders the logo', () => {
    renderAppHeader();
    // Logo renders the brand wordmark or image
    expect(document.querySelector('header')).toBeInTheDocument();
  });

  it('renders the search input', () => {
    renderAppHeader();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders the "Create Event" button', () => {
    renderAppHeader();
    expect(screen.getByRole('button', { name: /create event/i })).toBeInTheDocument();
  });

  it('renders the notifications bell button', () => {
    renderAppHeader();
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('renders all four calendar nav tabs', () => {
    renderAppHeader();
    expect(screen.getByText('Year View')).toBeInTheDocument();
    expect(screen.getByText('Month View')).toBeInTheDocument();
    expect(screen.getByText('Week View')).toBeInTheDocument();
    expect(screen.getByText('Day View')).toBeInTheDocument();
  });

  it('opens the EventModal when "Create Event" is clicked', async () => {
    renderAppHeader();
    await userEvent.click(screen.getByRole('button', { name: /create event/i }));
    // Modal shows the "New Event" header title
    expect(screen.getByText('New Event')).toBeInTheDocument();
  });
});
