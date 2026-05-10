'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MediaGridProps<T> {
  items: T[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  emptyIcon?: string;
  className?: string;
  renderItem: (item: T) => React.ReactNode;
}

export function MediaGrid<T>({
  items,
  loading = false,
  error = null,
  emptyMessage = 'No items found',
  emptyIcon = '📦',
  className,
  renderItem,
}: MediaGridProps<T>) {
  if (loading) {
    return (
      <div
        className={cn(
          'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4',
          className
        )}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <span className="text-4xl mb-3 block">⚠️</span>
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center border-2 border-dashed border-muted rounded-lg p-8">
          <span className="text-4xl mb-3 block">{emptyIcon}</span>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4',
        className
      )}
    >
      {items.map((item) => renderItem(item))}
    </div>
  );
}
