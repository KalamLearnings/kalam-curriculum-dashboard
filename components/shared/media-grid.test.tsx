import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MediaGrid } from './media-grid';

describe('MediaGrid', () => {
  const items = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
  ];

  it('renders items using renderItem function', () => {
    render(
      <MediaGrid
        items={items}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
      />
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('shows loading skeletons when loading', () => {
    render(
      <MediaGrid
        items={[]}
        loading={true}
        renderItem={() => null}
      />
    );

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows error message when error is provided', () => {
    render(
      <MediaGrid
        items={[]}
        error="Something went wrong"
        renderItem={() => null}
      />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('shows empty state when items array is empty', () => {
    render(
      <MediaGrid
        items={[]}
        emptyMessage="No items found"
        emptyIcon="📦"
        renderItem={() => null}
      />
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('📦')).toBeInTheDocument();
  });

  it('shows custom empty message', () => {
    render(
      <MediaGrid
        items={[]}
        emptyMessage="Custom empty message"
        renderItem={() => null}
      />
    );

    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });

  it('does not show loading when items exist', () => {
    render(
      <MediaGrid
        items={items}
        loading={true}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
      />
    );

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('prioritizes loading over error (shows skeletons while loading)', () => {
    render(
      <MediaGrid
        items={[]}
        loading={true}
        error="Error occurred"
        renderItem={() => null}
      />
    );

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.queryByText('Error occurred')).not.toBeInTheDocument();
  });
});
