import { render, screen } from '@testing-library/react';
import { Logo } from '../index';

describe('Logo', () => {
  it('shows the app version', () => {
    render(<Logo />);

    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });
});
