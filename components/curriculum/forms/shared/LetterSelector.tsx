import React, { useState, useEffect } from 'react';
import { LetterSelectorModal } from '../../LetterSelectorModal';
import type { Letter } from '@/lib/hooks/useLetters';
import type { Topic } from '@/lib/schemas/curriculum';
import type { LetterForm } from '../ArabicLetterGrid';

interface LetterSelectorPropsBase {
  topic?: Topic | null;
  label?: string;
  hint?: string;
  /** Whether to show form selector in the modal */
  showFormSelector?: boolean;
  /** Letters to disable in the grid */
  disabledLetters?: string[];
  /** Tooltip for disabled letters */
  disabledTooltip?: string;
}

interface SingleSelectProps extends LetterSelectorPropsBase {
  multiSelect?: false;
  value: string;
  onChange: (value: string, form?: LetterForm) => void;
  /** Current selected form */
  selectedForm?: LetterForm;
}

interface MultiSelectProps extends LetterSelectorPropsBase {
  multiSelect: true;
  value: string[];
  onChange: (value: string[]) => void;
  selectedForm?: never;
}

type LetterSelectorProps = SingleSelectProps | MultiSelectProps;

/**
 * Reusable letter selector component that:
 * - Auto-populates from topic metadata (single select only)
 * - Displays letter(s) in a nice card UI
 * - Allows changing via modal with optional form selection
 * - Supports both single and multi-select modes
 */
export function LetterSelector(props: LetterSelectorProps) {
  const {
    topic,
    label = "Target Letter",
    hint = "Letter from current topic",
    showFormSelector,
    disabledLetters = [],
    disabledTooltip,
  } = props;

  const [showLetterSelector, setShowLetterSelector] = useState(false);

  const isMultiSelect = props.multiSelect === true;
  const value = props.value;
  const selectedForm = isMultiSelect ? 'isolated' : (props.selectedForm || 'isolated');

  // Auto-populate letter from topic when component mounts or topic changes (single select only)
  useEffect(() => {
    if (!isMultiSelect && topic?.letter) {
      const topicLetter = topic.letter.letter;
      const singleValue = value as string;
      if (topicLetter && !singleValue) {
        (props as SingleSelectProps).onChange(topicLetter, selectedForm);
      }
    }
  }, [topic, value, isMultiSelect, selectedForm]);

  // Get form label for display
  const formLabels: Record<LetterForm, string> = {
    isolated: 'Isolated',
    initial: 'Initial',
    medial: 'Medial',
    final: 'Final',
  };

  const handleSelect = (letter: Letter | Letter[], form?: LetterForm) => {
    if (isMultiSelect) {
      const letters = letter as Letter[];
      (props as MultiSelectProps).onChange(letters.map(l => l.letter));
    } else {
      const singleLetter = letter as Letter;
      (props as SingleSelectProps).onChange(singleLetter.letter, form);
    }
  };

  // Render display based on mode
  const renderDisplay = () => {
    if (isMultiSelect) {
      const letters = value as string[];
      if (letters.length === 0) {
        return (
          <div className="text-sm text-gray-500">No letters selected</div>
        );
      }
      return (
        <div className="flex flex-wrap gap-2">
          {letters.map((letter, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm border border-blue-100"
            >
              <span className="text-2xl font-arabic text-blue-900">{letter}</span>
            </div>
          ))}
        </div>
      );
    } else {
      const singleValue = value as string;
      const shouldShowForm = showFormSelector !== false;
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-16 h-16 bg-white rounded-lg shadow-sm border border-blue-100">
            <span className="text-4xl font-arabic text-blue-900">
              {singleValue || '—'}
            </span>
          </div>
          <div className="flex-1">
            {topic?.letter?.name_english ? (
              <>
                <div className="text-sm font-medium text-gray-900">
                  {topic.letter.name_english}
                </div>
                <div className="text-xs text-gray-600">
                  {shouldShowForm ? `${formLabels[selectedForm]} Form` : 'Topic Letter'}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">
                {singleValue
                  ? (shouldShowForm ? `Custom Letter • ${formLabels[selectedForm]}` : 'Custom Letter')
                  : 'No letter selected'}
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Letter Display Card */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg flex-1 min-h-[88px]">
          {renderDisplay()}
        </div>

        {/* Change Button */}
        <button
          type="button"
          onClick={() => setShowLetterSelector(true)}
          className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-blue-700 bg-white border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Change
        </button>
      </div>

      {/* Letter Selector Modal */}
      <LetterSelectorModal
        isOpen={showLetterSelector}
        onClose={() => setShowLetterSelector(false)}
        onSelect={handleSelect}
        selectedLetter={value}
        selectedForm={selectedForm}
        showFormSelector={showFormSelector}
        multiSelect={isMultiSelect}
        disabledLetters={disabledLetters}
        disabledTooltip={disabledTooltip}
      />
    </>
  );
}
