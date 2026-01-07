/**
 * ModeToggle Component
 *
 * A reusable toggle switch for selecting between modes (e.g., text vs image).
 * Used by MultipleChoiceActivityForm, ContentWithCardsActivityForm, etc.
 */

import React from 'react';

export interface ModeOption<T extends string = string> {
  value: T;
  label: string;
  icon?: string;
}

interface ModeToggleProps<T extends string = string> {
  /** Label displayed before the toggle */
  label: string;
  /** Currently selected mode */
  value: T;
  /** Available mode options */
  options: ModeOption<T>[];
  /** Called when mode changes */
  onChange: (value: T) => void;
  /** Whether to show a border below */
  borderBottom?: boolean;
  /** Whether to show a border above */
  borderTop?: boolean;
}

export function ModeToggle<T extends string = string>({
  label,
  value,
  options,
  onChange,
  borderBottom = false,
  borderTop = false,
}: ModeToggleProps<T>) {
  return (
    <div className={`
      ${borderBottom ? 'border-b pb-4' : ''}
      ${borderTop ? 'border-t pt-4' : ''}
    `}>
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="inline-flex gap-1 bg-gray-100 p-1 rounded-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${value === option.value
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {option.icon && <span className="mr-1">{option.icon}</span>}
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Pre-defined mode options for common use cases
export const TEXT_IMAGE_MODE_OPTIONS: ModeOption<'text' | 'image'>[] = [
  { value: 'text', label: 'Text', icon: '📝' },
  { value: 'image', label: 'Image', icon: '🖼️' },
];

export const LETTER_WORD_IMAGE_MODE_OPTIONS: ModeOption<'letter' | 'word' | 'image'>[] = [
  { value: 'letter', label: 'Letter', icon: '📝' },
  { value: 'word', label: 'Word', icon: '📝' },
  { value: 'image', label: 'Image', icon: '🖼️' },
];

export default ModeToggle;
