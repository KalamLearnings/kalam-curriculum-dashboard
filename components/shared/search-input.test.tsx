import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from './search-input';

describe('SearchInput', () => {
  it('renders with placeholder', () => {
    render(<SearchInput value="" onChange={() => {}} placeholder="Search..." />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(<SearchInput value="test value" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('test value');
  });

  it('debounces onChange calls', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} debounceMs={100} />);

    await user.type(screen.getByRole('textbox'), 'test');

    expect(onChange).not.toHaveBeenCalled();

    await waitFor(
      () => {
        expect(onChange).toHaveBeenCalledWith('test');
      },
      { timeout: 200 }
    );
  });

  it('shows clear button when value exists', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="test" onChange={onChange} />);

    const clearButton = screen.getByRole('button');
    await user.click(clearButton);

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('does not show clear button when value is empty', () => {
    render(<SearchInput value="" onChange={() => {}} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    render(<SearchInput value="" onChange={() => {}} loading />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('does not show loading spinner when not loading', () => {
    render(<SearchInput value="" onChange={() => {}} loading={false} />);
    expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
  });
});
