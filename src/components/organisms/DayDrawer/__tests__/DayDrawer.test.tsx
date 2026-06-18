import { act, createRef } from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DayDrawer, type IDayDrawerHandle } from '../index';
import { renderWithProviders } from 'app/test/utils';
import type { IEvent } from 'app/store/slices/eventSlice';

// A date at UTC midnight so day-boundary math is clean
const DAY = new Date(Date.UTC(2024, 0, 15)); // 2024-01-15

const EVENT_ON_DAY: IEvent = {
  _id: 'e1',
  title: 'Morning Sync',
  startDate: new Date(Date.UTC(2024, 0, 15, 9, 0)).toISOString(),  // 09:00 UTC
  endDate: new Date(Date.UTC(2024, 0, 15, 10, 0)).toISOString(), // 10:00 UTC
  allDay: false,
  alert: 0,
  labelId: '',
  description: '',
};

const EVENT_OTHER_DAY: IEvent = {
  _id: 'e2',
  title: 'Other Day Event',
  startDate: new Date(Date.UTC(2024, 0, 16, 9, 0)).toISOString(),
  endDate: new Date(Date.UTC(2024, 0, 16, 10, 0)).toISOString(),
  allDay: false,
  alert: 0,
  labelId: '',
  description: '',
};

const storeState = {
  events: { items: [EVENT_ON_DAY, EVENT_OTHER_DAY] },
  notifications: { readIds: [], notifiedIds: [] },
};

function renderDayDrawer(onAddEvent = vi.fn(), onEventClick = vi.fn()) {
  const ref = createRef<IDayDrawerHandle>();
  const result = renderWithProviders(
    <DayDrawer ref={ref} onAddEvent={onAddEvent} onEventClick={onEventClick} />,
    { preloadedState: storeState },
  );
  return { ref, ...result };
}

describe('DayDrawer', () => {
  it('is hidden (translated off-screen) by default', () => {
    const { container } = renderDayDrawer();
    const panel = container.ownerDocument.body.querySelector('.translate-x-full');
    expect(panel).toBeInTheDocument();
  });

  it('opens and shows the formatted date header', () => {
    const { ref } = renderDayDrawer();
    fireEvent(document, new Event('click')); // ensure clean state
    act(() => ref.current!.open(DAY));

    expect(screen.getByText('01/15/2024')).toBeInTheDocument();
  });

  it('renders only events that fall on the opened day', () => {
    const { ref } = renderDayDrawer();
    act(() => ref.current!.open(DAY));

    expect(screen.getByText('Morning Sync')).toBeInTheDocument();
    expect(screen.queryByText('Other Day Event')).not.toBeInTheDocument();
  });

  it('closes when the overlay backdrop is clicked', async () => {
    const { ref, container } = renderDayDrawer();
    act(() => ref.current!.open(DAY));
    expect(screen.getByText('01/15/2024')).toBeInTheDocument();

    const overlay = container.ownerDocument.body.querySelector('.bg-black\\/20');
    await userEvent.click(overlay!);

    const panel = container.ownerDocument.body.querySelector('.translate-x-full');
    expect(panel).toBeInTheDocument();
  });

  it('closes on Escape key', async () => {
    const { ref, container } = renderDayDrawer();
    act(() => ref.current!.open(DAY));

    await userEvent.keyboard('{Escape}');

    const panel = container.ownerDocument.body.querySelector('.translate-x-full');
    expect(panel).toBeInTheDocument();
  });

  it('closes via ref.close()', () => {
    const { ref, container } = renderDayDrawer();
    act(() => ref.current!.open(DAY));
    act(() => ref.current!.close());

    const panel = container.ownerDocument.body.querySelector('.translate-x-full');
    expect(panel).toBeInTheDocument();
  });

  it('calls onAddEvent with the opened date when "Add Event" is clicked', async () => {
    const onAddEvent = vi.fn();
    const { ref } = renderDayDrawer(onAddEvent);
    act(() => ref.current!.open(DAY));

    await userEvent.click(screen.getByText('Add Event'));
    expect(onAddEvent).toHaveBeenCalledWith(DAY);
  });

  it('calls onEventClick with the event when an event card is clicked', async () => {
    const onEventClick = vi.fn();
    const { ref } = renderDayDrawer(vi.fn(), onEventClick);
    act(() => ref.current!.open(DAY));

    await userEvent.click(screen.getByText('Morning Sync'));
    expect(onEventClick).toHaveBeenCalledWith(EVENT_ON_DAY);
  });
});
