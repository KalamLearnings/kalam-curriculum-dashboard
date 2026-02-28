import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLetters, type Letter } from '@/lib/hooks/useLetters';

// Re-export types from central utilities for backward compatibility
export type { LetterForm, LetterReference } from '@/lib/utils/letterReference';
import type { LetterForm, LetterReference } from '@/lib/utils/letterReference';

// For multi-form selection: a letter with multiple forms selected
export interface LetterWithForms {
  letterId: string;
  forms: LetterForm[];
}

interface ArabicLetterGridProps {
  /** Currently selected letter(s) */
  value: LetterReference | LetterReference[] | null;
  /** Callback when letter selection changes */
  onChange: (value: LetterReference | LetterReference[] | null) => void;
  /** Allow multiple letter selection */
  multiSelect?: boolean;
  /** Allow multiple form selection per letter (only for multiSelect mode) */
  multiFormSelect?: boolean;
  /** Letter IDs to disable (e.g., target letter when selecting distractors) */
  disabledLetterIds?: string[];
  /** Tooltip for disabled letters */
  disabledTooltip?: string;
  /** Show loading state */
  loading?: boolean;
  /** Show form selector when a letter is selected */
  showFormSelector?: boolean;
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
  multiFormSelect = false,
  disabledLetterIds = [],
  disabledTooltip = 'This letter is not available',
  loading,
  showFormSelector = false,
}: ArabicLetterGridProps) {
  const { letters, loading: lettersLoading } = useLetters();

  // Track the last clicked letter for multi-select form display
  const [lastClickedLetterId, setLastClickedLetterId] = useState<string | null>(null);

  const isLoading = loading ?? lettersLoading;

  // Helper to normalize value to array
  const getSelectedRefs = (): LetterReference[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
  };

  // Get unique selected letter IDs
  const getSelectedLetterIds = (): string[] => {
    return [...new Set(getSelectedRefs().map(ref => ref.letterId))];
  };

  // Get forms for a specific letter (for multiFormSelect mode)
  const getFormsForLetter = (letterId: string): LetterForm[] => {
    return getSelectedRefs()
      .filter(ref => ref.letterId === letterId)
      .map(ref => ref.form);
  };

  // Reset lastClickedLetterId when value changes externally
  useEffect(() => {
    if (multiSelect) {
      const selectedIds = getSelectedLetterIds();
      if (selectedIds.length > 0 && !lastClickedLetterId) {
        setLastClickedLetterId(selectedIds[selectedIds.length - 1]);
      } else if (selectedIds.length === 0) {
        setLastClickedLetterId(null);
      }
    }
  }, [value, multiSelect]);

  const handleLetterClick = (letter: Letter) => {
    if (multiSelect) {
      const currentRefs = getSelectedRefs();
      const letterForms = getFormsForLetter(letter.id);

      if (multiFormSelect) {
        // Multi-form select mode
        if (letterForms.length > 0) {
          // Letter already selected - remove it (toggle off)
          const remaining = currentRefs.filter(ref => ref.letterId !== letter.id);
          const remainingIds = [...new Set(remaining.map(r => r.letterId))];
          setLastClickedLetterId(remainingIds.length > 0 ? remainingIds[remainingIds.length - 1] : null);
          onChange(remaining.length > 0 ? remaining : null);
        } else {
          // New letter - add with 'isolated' form by default
          setLastClickedLetterId(letter.id);
          onChange([...currentRefs, { letterId: letter.id, form: 'isolated' }]);
        }
      } else {
        // Simple multi-select mode (each letter gets one form - 'isolated' by default)
        if (letterForms.length > 0) {
          // Remove this letter
          const remaining = currentRefs.filter(ref => ref.letterId !== letter.id);
          const remainingIds = [...new Set(remaining.map(r => r.letterId))];
          setLastClickedLetterId(remainingIds.length > 0 ? remainingIds[remainingIds.length - 1] : null);
          onChange(remaining.length > 0 ? remaining : null);
        } else {
          // Add this letter
          setLastClickedLetterId(letter.id);
          onChange([...currentRefs, { letterId: letter.id, form: 'isolated' }]);
        }
      }
    } else {
      // Single select mode
      const currentRef = value && !Array.isArray(value) ? value : null;
      if (currentRef?.letterId === letter.id) {
        // Same letter clicked - keep selection, just update lastClicked for form selector
        setLastClickedLetterId(letter.id);
      } else {
        // New letter selected - default to 'isolated' form
        setLastClickedLetterId(letter.id);
        onChange({ letterId: letter.id, form: 'isolated' });
      }
    }
  };

  const handleFormChange = (form: LetterForm) => {
    if (multiSelect && multiFormSelect && lastClickedLetterId) {
      // Multi-form select mode - toggle form for last clicked letter
      const currentRefs = getSelectedRefs();
      const letterForms = getFormsForLetter(lastClickedLetterId);

      if (letterForms.includes(form)) {
        // Remove this form
        const newRefs = currentRefs.filter(
          ref => !(ref.letterId === lastClickedLetterId && ref.form === form)
        );

        // Check if letter still has any forms
        const remainingForms = newRefs.filter(ref => ref.letterId === lastClickedLetterId);
        if (remainingForms.length === 0) {
          // No forms left - letter is removed
          const remainingIds = [...new Set(newRefs.map(r => r.letterId))];
          setLastClickedLetterId(remainingIds.length > 0 ? remainingIds[remainingIds.length - 1] : null);
        }

        onChange(newRefs.length > 0 ? newRefs : null);
      } else {
        // Add this form
        onChange([...currentRefs, { letterId: lastClickedLetterId, form }]);
      }
    } else if (multiSelect && !multiFormSelect && lastClickedLetterId) {
      // Multi-select but single form per letter - update the form for last clicked letter
      const currentRefs = getSelectedRefs();
      const newRefs = currentRefs.map(ref =>
        ref.letterId === lastClickedLetterId ? { ...ref, form } : ref
      );
      onChange(newRefs);
    } else if (!multiSelect) {
      // Single select mode - update the form
      const currentRef = value && !Array.isArray(value) ? value : null;
      if (currentRef) {
        onChange({ ...currentRef, form });
      }
    }
  };

  const isSelected = (letterId: string) => {
    return getSelectedLetterIds().includes(letterId);
  };

  const isDisabled = (letterId: string) => {
    return disabledLetterIds.includes(letterId);
  };

  const isFormSelected = (form: LetterForm): boolean => {
    if (multiSelect && multiFormSelect && lastClickedLetterId) {
      return getFormsForLetter(lastClickedLetterId).includes(form);
    }
    if (multiSelect && !multiFormSelect && lastClickedLetterId) {
      const ref = getSelectedRefs().find(r => r.letterId === lastClickedLetterId);
      return ref?.form === form;
    }
    if (!multiSelect && value && !Array.isArray(value)) {
      return value.form === form;
    }
    return form === 'isolated';
  };

  // Get selected letter data for form selector display
  const getSelectedLetterData = (): Letter | null => {
    const targetId = multiSelect ? lastClickedLetterId : (value && !Array.isArray(value) ? value.letterId : null);
    return targetId ? letters.find(l => l.id === targetId) || null : null;
  };

  const selectedLetterData = getSelectedLetterData();
  const shouldShowFormSelector = showFormSelector && (multiSelect ? lastClickedLetterId : selectedLetterData);

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
          const selected = isSelected(letter.id);
          const disabled = isDisabled(letter.id);
          const isLastClicked = multiSelect && lastClickedLetterId === letter.id;

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
                    ? isLastClicked
                      ? 'border-blue-600 bg-blue-100 ring-2 ring-blue-600 ring-offset-2'
                      : 'border-blue-600 bg-blue-100'
                    : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
              )}
            >
              <div className="text-3xl font-arabic mb-1">{letter.letter}</div>
              <div className="text-xs text-gray-600">{letter.name_english}</div>
            </button>
          );
        })}
      </div>

      {/* Form Selector */}
      {shouldShowFormSelector && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {selectedLetterData
              ? `Select Letter Form${multiFormSelect ? 's' : ''} for "${selectedLetterData.name_english}"`
              : 'Select Letter Form'}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['isolated', 'initial', 'medial', 'final'] as LetterForm[]).map((form) => {
              const formSelected = isFormSelected(form);
              const formCharacter = selectedLetterData?.forms?.[form] || selectedLetterData?.letter || formLabels[form];

              return (
                <button
                  key={form}
                  type="button"
                  onClick={() => handleFormChange(form)}
                  disabled={multiFormSelect && !lastClickedLetterId}
                  className={cn(
                    'px-4 py-3 rounded-lg border-2 transition-all',
                    'flex flex-col items-center justify-center',
                    'hover:border-blue-400 hover:bg-blue-50',
                    multiFormSelect && !lastClickedLetterId
                      ? 'opacity-50 cursor-not-allowed'
                      : formSelected
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
            {multiFormSelect
              ? lastClickedLetterId
                ? 'Click forms to toggle selection for this letter'
                : 'Select a letter first to choose its forms'
              : `Selected form: ${formLabels[isFormSelected('isolated') ? 'isolated' : isFormSelected('initial') ? 'initial' : isFormSelected('medial') ? 'medial' : 'final']}`}
          </p>
        </div>
      )}
    </div>
  );
}
