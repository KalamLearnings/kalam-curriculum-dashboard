import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnvironmentBanner } from './environment-banner';

describe('EnvironmentBanner', () => {
  it('shows minimal indicator for DEV', () => {
    render(<EnvironmentBanner environment="dev" onSwitchRequest={() => {}} />);

    const banner = document.querySelector('.h-1');
    expect(banner).toBeInTheDocument();
    expect(screen.queryByText(/production/i)).not.toBeInTheDocument();
  });

  it('shows prominent warning for PROD', () => {
    render(<EnvironmentBanner environment="prod" onSwitchRequest={() => {}} />);

    expect(screen.getByText(/production mode/i)).toBeInTheDocument();
    expect(screen.getByText(/changes affect live users/i)).toBeInTheDocument();
  });

  it('shows switch button in PROD mode', () => {
    render(<EnvironmentBanner environment="prod" onSwitchRequest={() => {}} />);

    expect(screen.getByRole('button', { name: /switch to dev/i })).toBeInTheDocument();
  });

  it('does not show switch button in DEV mode', () => {
    render(<EnvironmentBanner environment="dev" onSwitchRequest={() => {}} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onSwitchRequest when switch button clicked in PROD', async () => {
    const user = userEvent.setup();
    const onSwitchRequest = vi.fn();
    render(<EnvironmentBanner environment="prod" onSwitchRequest={onSwitchRequest} />);

    await user.click(screen.getByRole('button', { name: /switch to dev/i }));
    expect(onSwitchRequest).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <EnvironmentBanner
        environment="dev"
        onSwitchRequest={() => {}}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
