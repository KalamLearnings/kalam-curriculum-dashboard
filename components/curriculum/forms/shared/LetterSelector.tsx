import React, { useState, useEffect } from 'react';
import { LetterSelectorModal } from '../../LetterSelectorModal';
import { useLetters } from '@/lib/hooks/useLetters';
import type { Topic } from '@/lib/schemas/curriculum';
import type { LetterForm, LetterReference, LetterFilterFn } from '../ArabicLetterGrid';

interface LetterSelectorPropsBase {
  topic?: Topic | null;
  /** Whether to show form selector in the modal */
  showFormSelector?: boolean;
  /** Letter IDs to disable in the grid */
  disabledLetterIds?: string[];
  /** Tooltip for disabled letters */
  disabledTooltip?: string;
  /** Filter function to show only specific letters */
  letterFilter?: LetterFilterFn;
}

interface SingleSelectProps extends LetterSelectorPropsBase {
  multiSelect?: false;
  multiFormSelect?: false;
  value: LetterReference | null;
  onChange: (value: LetterReference | null) => void;
}

interface MultiSelectProps extends LetterSelectorPropsBase {
  multiSelect: true;
  multiFormSelect?: boolean;
  value: LetterReference[];
  onChange: (value: LetterReference[]) => void;
}

type LetterSelectorProps = SingleSelectProps | MultiSelectProps;

const formLabels: Record<LetterForm, string> = {
  isolated: 'Isolated',
  initial: 'Initial',
  medial: 'Medial',
  final: 'Final',
};

/**
 * Reusable letter selector component that:
 * - Auto-populates from topic metadata (single select only)
 * - Displays letter(s) in a nice card UI
 * - Allows changing via modal with optional form selection
 * - Supports single and multi-select modes
 * - Uses LetterReference format ({ letterId, form })
 */
export function LetterSelector(props: LetterSelectorProps) {
  const {
    topic,
    showFormSelector = true,
    disabledLetterIds = [],
    disabledTooltip,
    letterFilter,
  } = props;

  const { letters } = useLetters();
  const [showLetterSelector, setShowLetterSelector] = useState(false);

  const isMultiSelect = props.multiSelect === true;
  const isMultiFormSelect = isMultiSelect && props.multiFormSelect === true;

  // Auto-populate letter from topic when component mounts or topic changes (single select only)
  useEffect(() => {
    if (!isMultiSelect && topic?.letter) {
      const topicLetterId = topic.letter.id;
      const currentValue = props.value as LetterReference | null;
      if (topicLetterId && !currentValue) {
        (props as SingleSelectProps).onChange({
          letterId: topicLetterId,
          form: 'isolated'
        });
      }
    }
  }, [topic, isMultiSelect]);

  const handleSelect = (selected: LetterReference | LetterReference[]) => {
    if (isMultiSelect) {
      const refs = Array.isArray(selected) ? selected : [selected];
      (props as MultiSelectProps).onChange(refs);
    } else {
      const ref = Array.isArray(selected) ? selected[0] : selected;
      (props as SingleSelectProps).onChange(ref);
    }
  };

  // Helper to get letter data from letterId
  const getLetterData = (letterId: string) => {
    return letters.find(l => l.id === letterId);
  };

  // Helper to get the display character for a letter reference
  const getDisplayChar = (ref: LetterReference): string => {
    const letterData = getLetterData(ref.letterId);
    if (!letterData) return '?';
    if (letterData.forms && letterData.forms[ref.form]) {
      return letterData.forms[ref.form]!;
    }
    return letterData.letter;
  };

  // Render display based on mode
  const renderDisplay = () => {
    if (isMultiSelect) {
      const refs = props.value as LetterReference[];
      if (refs.length === 0) {
        return (
          <div className="text-sm text-gray-500">No letters selected</div>
        );
      }

      // Group references by letterId for display
      const groupedByLetter = refs.reduce((acc, ref) => {
        if (!acc[ref.letterId]) {
          acc[ref.letterId] = [];
        }
        acc[ref.letterId].push(ref.form);
        return acc;
      }, {} as Record<string, LetterForm[]>);

      return (
        <div className="flex flex-wrap gap-2">
          {Object.entries(groupedByLetter).map(([letterId, forms]) => {
            const letterData = getLetterData(letterId);
            const displayChar = letterData?.letter || '?';
            return (
              <div
                key={letterId}
                className="flex flex-col items-center px-3 py-2 bg-white rounded-lg shadow-sm border border-blue-100"
              >
                <span className="text-2xl font-arabic text-blue-900">{displayChar}</span>
                {isMultiFormSelect && (
                  <span className="text-xs text-gray-500 mt-1">
                    {forms.map(f => formLabels[f].charAt(0)).join(', ')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      );
    } else {
      const ref = props.value as LetterReference | null;
      const letterData = ref ? getLetterData(ref.letterId) : null;
      const displayChar = ref ? getDisplayChar(ref) : null;

      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-16 h-16 bg-white rounded-lg shadow-sm border border-blue-100">
            <span className="text-4xl font-arabic text-blue-900">
              {displayChar || '—'}
            </span>
          </div>
          <div className="flex-1">
            {letterData ? (
              <>
                <div className="text-sm font-medium text-gray-900">
                  {letterData.name_english}
                </div>
                <div className="text-xs text-gray-600">
                  {showFormSelector && ref ? `${formLabels[ref.form]} Form` : 'Selected Letter'}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">
                {ref ? 'Loading...' : 'No letter selected'}
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  // Convert value to modal format
  const getModalValue = (): LetterReference | LetterReference[] | null => {
    if (isMultiSelect) {
      const refs = props.value as LetterReference[];
      return refs.length > 0 ? refs : null;
    }
    return props.value as LetterReference | null;
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
        selectedValue={getModalValue()}
        showFormSelector={showFormSelector}
        multiSelect={isMultiSelect}
        multiFormSelect={isMultiFormSelect}
        disabledLetterIds={disabledLetterIds}
        disabledTooltip={disabledTooltip}
        letterFilter={letterFilter}
      />
    </>
  );
}
