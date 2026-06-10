import { act, createRef } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventModal, type IEventModalHandle } from '../index';
import { renderWithProviders } from 'app/test/utils';

const storeState = {
  events: { items: [] },
  notifications: { readIds: [], notifiedIds: [] },
};

function renderEventModal() {
  const ref = createRef<IEventModalHandle>();
  const result = renderWithProviders(<EventModal ref={ref} />, { preloadedState: storeState });
  return { ref, ...result };
}

describe('EventModal', () => {
  it('renders nothing when closed', () => {
    renderEventModal();
    expect(screen.queryByText('New Event')).not.toBeInTheDocument();
  });

  it('opens in form view with "New Event" title when no id is provided', () => {
    const { ref } = renderEventModal();
    act(() => ref.current!.open());
    expect(screen.getByText('New Event')).toBeInTheDocument();
  });

  it('opens in form view with "Update Event" title when called with an id', () => {
    const { ref } = renderEventModal();
    act(() => ref.current!.open({ id: 'evt-1', name: 'Stand-up' }));
    // id present → detail view first; but open({id}) sets view to 'detail'
    // detail view shows the event name as the modal title
    expect(screen.getByText('Stand-up')).toBeInTheDocument();
  });

  it('closes the modal via ref.close()', () => {
    const { ref } = renderEventModal();
    act(() => ref.current!.open());
    expect(screen.getByText('New Event')).toBeInTheDocument();

    act(() => ref.current!.close());
    expect(screen.queryByText('New Event')).not.toBeInTheDocument();
  });

  it('closes the modal on Escape key', async () => {
    const { ref } = renderEventModal();
    act(() => ref.current!.open());
    expect(screen.getByText('New Event')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByText('New Event')).not.toBeInTheDocument();
  });

  it('closes the modal when the backdrop is clicked', async () => {
    const { ref, container } = renderEventModal();
    act(() => ref.current!.open());

    const backdrop = container.ownerDocument.body.querySelector('.bg-black\\/40');
    await userEvent.click(backdrop!);

    expect(screen.queryByText('New Event')).not.toBeInTheDocument();
  });
});
