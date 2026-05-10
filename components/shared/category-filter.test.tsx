import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryFilter } from './category-filter';

describe('CategoryFilter', () => {
  const categories = [
    { value: 'fruits' as const, label: 'Fruits', icon: '🍎', count: 10 },
    { value: 'animals' as const, label: 'Animals', icon: '🐘', count: 5 },
    { value: 'colors' as const, label: 'Colors', count: 3 },
  ];

  it('renders all categories', () => {
    render(<CategoryFilter categories={categories} onChange={() => {}} />);

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Fruits')).toBeInTheDocument();
    expect(screen.getByText('Animals')).toBeInTheDocument();
    expect(screen.getByText('Colors')).toBeInTheDocument();
  });

  it('renders category icons when provided', () => {
    render(<CategoryFilter categories={categories} onChange={() => {}} />);

    expect(screen.getByText('🍎')).toBeInTheDocument();
    expect(screen.getByText('🐘')).toBeInTheDocument();
  });

  it('renders category counts when provided', () => {
    render(<CategoryFilter categories={categories} onChange={() => {}} />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders total count on All button', () => {
    render(<CategoryFilter categories={categories} onChange={() => {}} totalCount={18} />);

    expect(screen.getByText('18')).toBeInTheDocument();
  });

  it('calls onChange with category value when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CategoryFilter categories={categories} onChange={onChange} />);

    await user.click(screen.getByText('Fruits'));
    expect(onChange).toHaveBeenCalledWith('fruits');
  });

  it('calls onChange with undefined when All is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CategoryFilter categories={categories} selected="fruits" onChange={onChange} />
    );

    await user.click(screen.getByText('All'));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('highlights selected category', () => {
    render(
      <CategoryFilter categories={categories} selected="fruits" onChange={() => {}} />
    );

    const fruitsButton = screen.getByText('Fruits').closest('button');
    const allButton = screen.getByText('All').closest('button');

    expect(fruitsButton).toHaveClass('bg-primary');
    expect(allButton).not.toHaveClass('bg-primary');
  });

  it('highlights All when no category is selected', () => {
    render(<CategoryFilter categories={categories} onChange={() => {}} />);

    const allButton = screen.getByText('All').closest('button');
    expect(allButton).toHaveClass('bg-primary');
  });

  it('uses custom allLabel', () => {
    render(
      <CategoryFilter
        categories={categories}
        onChange={() => {}}
        allLabel="Show All"
      />
    );

    expect(screen.getByText('Show All')).toBeInTheDocument();
  });
});
