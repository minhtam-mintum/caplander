import { render, screen } from '@testing-library/react';
import { LoadingPage } from '../index';

describe('LoadingPage', () => {
  it('renders the logo image', () => {
    render(<LoadingPage />);
    const img = screen.getByAltText('Caplander');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/logo.png');
  });

  it('renders the brand name', () => {
    render(<LoadingPage />);
    expect(screen.getByText('Caplander')).toBeInTheDocument();
  });

  it('renders a loading bar', () => {
    const { container } = render(<LoadingPage />);
    // the animated bar is a nested div inside the progress track
    const track = container.querySelector('div > div > div');
    expect(track).toBeInTheDocument();
  });

  it('removes the #splash element from the DOM on unmount', () => {
    const splash = document.createElement('div');
    splash.id = 'splash';
    document.body.appendChild(splash);
    expect(document.getElementById('splash')).not.toBeNull();

    const { unmount } = render(<LoadingPage />);
    unmount();

    expect(document.getElementById('splash')).toBeNull();
  });

  it('does not throw when #splash is absent on unmount', () => {
    const { unmount } = render(<LoadingPage />);
    expect(() => unmount()).not.toThrow();
  });
});
