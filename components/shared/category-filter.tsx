'use client';

import { cn } from '@/lib/utils';

interface Category<T extends string> {
  value: T;
  label: string;
  icon?: string;
  count?: number;
}

interface CategoryFilterProps<T extends string> {
  categories: Category<T>[];
  selected?: T;
  onChange: (value: T | undefined) => void;
  allLabel?: string;
  allIcon?: string;
  totalCount?: number;
  color?: 'primary' | 'purple' | 'blue';
  className?: string;
}

export function CategoryFilter<T extends string>({
  categories,
  selected,
  onChange,
  allLabel = 'All',
  allIcon,
  totalCount,
  color = 'primary',
  className,
}: CategoryFilterProps<T>) {
  const colorClasses = {
    primary: {
      active: 'bg-primary text-primary-foreground',
      inactive: 'bg-muted text-muted-foreground hover:bg-muted/80',
      count: 'bg-primary/20',
      countActive: 'bg-primary-foreground/20',
    },
    purple: {
      active: 'bg-purple-600 text-white',
      inactive: 'bg-muted text-muted-foreground hover:bg-muted/80',
      count: 'bg-purple-100',
      countActive: 'bg-purple-500',
    },
    blue: {
      active: 'bg-blue-600 text-white',
      inactive: 'bg-muted text-muted-foreground hover:bg-muted/80',
      count: 'bg-blue-100',
      countActive: 'bg-blue-500',
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={cn('flex items-center gap-2 overflow-x-auto pb-2', className)}
    >
      <button
        onClick={() => onChange(undefined)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors',
          !selected ? colors.active : colors.inactive
        )}
      >
        {allIcon && <span>{allIcon}</span>}
        <span>{allLabel}</span>
        {totalCount !== undefined && (
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              !selected ? colors.countActive : colors.count
            )}
          >
            {totalCount}
          </span>
        )}
      </button>

      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onChange(category.value)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors',
            selected === category.value ? colors.active : colors.inactive
          )}
        >
          {category.icon && <span>{category.icon}</span>}
          <span>{category.label}</span>
          {category.count !== undefined && (
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                selected === category.value ? colors.countActive : colors.count
              )}
            >
              {category.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
