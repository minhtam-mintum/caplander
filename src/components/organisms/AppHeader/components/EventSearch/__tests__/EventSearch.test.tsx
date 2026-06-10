import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventSearch } from '../index';
import { renderWithProviders } from 'app/test/utils';
import type { IEvent } from 'app/store/slices/eventSlice';

const MOCK_EVENTS: IEvent[] = [
  { id: '1', name: 'Team Meeting', start: 1700000000000, end: 1700003600000, alert: 0, label: '', notes: '' },
  { id: '2', name: 'Lunch Break', start: 1700050000000, end: 1700053600000, alert: 0, label: '', notes: '' },
];

const storeState = {
  events: { items: MOCK_EVENTS },
  notifications: { readIds: [], notifiedIds: [] },
};

describe('EventSearch', () => {
  it('renders the search input', () => {
    renderWithProviders(<EventSearch onEventSelect={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows no results initially when query is empty', () => {
    renderWithProviders(<EventSearch onEventSelect={vi.fn()} />, { preloadedState: storeState });
    expect(screen.queryByText('Team Meeting')).not.toBeInTheDocument();
  });

  it('shows filtered results after debounce delay', async () => {
    renderWithProviders(<EventSearch onEventSelect={vi.fn()} />, { preloadedState: storeState });
    const input = screen.getByRole('textbox');

    await userEvent.type(input, 'Team');
    await waitFor(() => expect(screen.getByText('Team Meeting')).toBeInTheDocument(), { timeout: 500 });
    expect(screen.queryByText('Lunch Break')).not.toBeInTheDocument();
  });

  it('is case-insensitive when filtering', async () => {
    renderWithProviders(<EventSearch onEventSelect={vi.fn()} />, { preloadedState: storeState });
    await userEvent.type(screen.getByRole('textbox'), 'lunch');
    await waitFor(() => expect(screen.getByText('Lunch Break')).toBeInTheDocument(), { timeout: 500 });
  });

  it('calls onEventSelect with the correct event on result click', async () => {
    const onSelect = vi.fn();
    renderWithProviders(<EventSearch onEventSelect={onSelect} />, { preloadedState: storeState });

    await userEvent.type(screen.getByRole('textbox'), 'Team');
    await waitFor(() => screen.getByText('Team Meeting'), { timeout: 500 });
    fireEvent.mouseDown(screen.getByText('Team Meeting'));

    expect(onSelect).toHaveBeenCalledWith(MOCK_EVENTS[0]);
  });

  it('clears the input after a result is selected', async () => {
    renderWithProviders(<EventSearch onEventSelect={vi.fn()} />, { preloadedState: storeState });
    const input = screen.getByRole('textbox');

    await userEvent.type(input, 'Team');
    await waitFor(() => screen.getByText('Team Meeting'), { timeout: 500 });
    fireEvent.mouseDown(screen.getByText('Team Meeting'));

    expect(input).toHaveValue('');
  });

  it('closes the dropdown on Escape', async () => {
    renderWithProviders(<EventSearch onEventSelect={vi.fn()} />, { preloadedState: storeState });

    await userEvent.type(screen.getByRole('textbox'), 'Team');
    await waitFor(() => screen.getByText('Team Meeting'), { timeout: 500 });
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByText('Team Meeting')).not.toBeInTheDocument();
  });
});
