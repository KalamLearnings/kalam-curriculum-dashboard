import React from 'react';
import { cn } from '@/lib/utils';
import { useLetters, type Letter } from '@/lib/hooks/useLetters';

export type LetterForm = 'isolated' | 'initial' | 'medial' | 'final';

interface ArabicLetterGridProps {
  /** Currently selected letter(s) - single string for single select, array for multi-select */
  value: string | string[];
  /** Callback when letter selection changes */
  onChange: (value: string | string[]) => void;
  /** Allow multiple letter selection */
  multiSelect?: boolean;
  /** Letters to disable (e.g., target letter when selecting distractors) */
  disabledLetters?: string[];
  /** Tooltip for disabled letters */
  disabledTooltip?: string;
  /** Show loading state */
  loading?: boolean;
  /** Show form selector when a letter is selected (only for single select mode) */
  showFormSelector?: boolean;
  /** Currently selected form */
  selectedForm?: LetterForm;
  /** Callback when form selection changes */
  onFormChange?: (form: LetterForm) => void;
}

const formLabels: Record<LetterForm, string> = {
  isolated: 'Isolated',
  initial: 'Initial',
  medial: 'Medial',
  final: 'Final',
};

export function ArabicLetterGrid({
  value,
  onChange,
  multiSelect = false,
  disabledLetters = [],
  disabledTooltip = 'This letter is not available',
  loading,
  showFormSelector = false,
  selectedForm = 'isolated',
  onFormChange,
}: ArabicLetterGridProps) {
  const { letters, loading: lettersLoading } = useLetters();

  const isLoading = loading ?? lettersLoading;

  const handleLetterClick = (letter: Letter) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(letter.letter)) {
        onChange(currentValues.filter(l => l !== letter.letter));
      } else {
        onChange([...currentValues, letter.letter]);
      }
    } else {
      onChange(letter.letter);
      // Reset to isolated form when changing letter
      if (showFormSelector && onFormChange) {
        onFormChange('isolated');
      }
    }
  };

  const isSelected = (letterChar: string) => {
    if (multiSelect) {
      return Array.isArray(value) && value.includes(letterChar);
    }
    return value === letterChar;
  };

  const isDisabled = (letterChar: string) => {
    return disabledLetters.includes(letterChar);
  };

  // Get selected letter data for form selector
  const selectedLetterData = !multiSelect && typeof value === 'string'
    ? letters.find(l => l.letter === value)
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading letters...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Letter Grid */}
      <div className="grid grid-cols-7 gap-2">
        {letters.map((letter) => {
          const selected = isSelected(letter.letter);
          const disabled = isDisabled(letter.letter);

          return (
            <button
              key={letter.id}
              type="button"
              onClick={() => !disabled && handleLetterClick(letter)}
              disabled={disabled}
              title={disabled ? disabledTooltip : letter.name_english}
              className={cn(
                'aspect-square rounded-lg border-2 transition-all',
                'flex flex-col items-center justify-center',
                disabled
                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : selected
                    ? 'border-blue-600 bg-blue-100 ring-2 ring-blue-600 ring-offset-2'
                    : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
              )}
            >
              <div className="text-3xl font-arabic mb-1">{letter.letter}</div>
              <div className="text-xs text-gray-600">{letter.name_english}</div>
            </button>
          );
        })}
      </div>

      {/* Form Selector - shown when a letter is selected and showFormSelector is true */}
      {showFormSelector && selectedLetterData && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Letter Form
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['isolated', 'initial', 'medial', 'final'] as LetterForm[]).map((form) => {
              const isFormSelected = selectedForm === form;
              const formCharacter = selectedLetterData.forms?.[form] || selectedLetterData.letter;

              return (
                <button
                  key={form}
                  type="button"
                  onClick={() => onFormChange?.(form)}
                  className={cn(
                    'px-4 py-3 rounded-lg border-2 transition-all',
                    'flex flex-col items-center justify-center',
                    'hover:border-blue-400 hover:bg-blue-50',
                    isFormSelected
                      ? 'border-blue-600 bg-blue-100 ring-2 ring-blue-600 ring-offset-2'
                      : 'border-gray-300 bg-white'
                  )}
                >
                  <div className="text-2xl font-arabic mb-1">{formCharacter}</div>
                  <div className="text-xs text-gray-600">{formLabels[form]}</div>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            This will focus specifically on the {selectedForm} form
          </p>
        </div>
      )}
    </div>
  );
}
