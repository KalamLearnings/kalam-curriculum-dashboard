import React from 'react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

interface OptionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  columns?: number;
}

export function OptionSelector({ value, onChange, options, columns = 4 }: OptionSelectorProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
  }[columns] || 'grid-cols-4';

  return (
    <div className={`grid ${gridCols} gap-3`}>
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            )}
          >
            {/* Icon if provided */}
            {option.icon && (
              <div className="text-3xl">
                {option.icon}
              </div>
            )}

            {/* Label */}
            <div className="text-sm font-medium text-gray-900 text-center">
              {option.label}
            </div>

            {/* Description if provided */}
            {option.description && (
              <div className="text-xs text-gray-500 text-center">
                {option.description}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
