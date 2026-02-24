import React, { useState, useEffect } from 'react';
import { LetterSelectorModal } from '../../LetterSelectorModal';
import type { Letter } from '@/lib/hooks/useLetters';
import type { Topic } from '@/lib/schemas/curriculum';
import type { LetterForm } from '../ArabicLetterGrid';

interface LetterSelectorProps {
  value: string;
  onChange: (value: string, form?: LetterForm) => void;
  topic?: Topic | null;
  label?: string;
  hint?: string;
  /** Current selected form */
  selectedForm?: LetterForm;
  /** Whether to show form selector in the modal */
  showFormSelector?: boolean;
}

/**
 * Reusable letter selector component that:
 * - Auto-populates from topic metadata
 * - Displays letter in a nice card UI
 * - Allows changing via modal with optional form selection
 */
export function LetterSelector({
  value,
  onChange,
  topic,
  label = "Target Letter",
  hint = "Letter from current topic",
  selectedForm = 'isolated',
  showFormSelector = true,
}: LetterSelectorProps) {
  const [showLetterSelector, setShowLetterSelector] = useState(false);

  // Auto-populate letter from topic when component mounts or topic changes
  useEffect(() => {
    if (topic?.letter) {
      const topicLetter = topic.letter.letter;
      if (topicLetter && !value) {
        onChange(topicLetter, selectedForm);
      }
    }
  }, [topic, value, onChange, selectedForm]);

  // Get form label for display
  const formLabels: Record<LetterForm, string> = {
    isolated: 'Isolated',
    initial: 'Initial',
    medial: 'Medial',
    final: 'Final',
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Letter Display Card */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg flex-1">
          <div className="flex items-center justify-center w-16 h-16 bg-white rounded-lg shadow-sm border border-blue-100">
            <span className="text-4xl font-arabic text-blue-900">
              {value || '—'}
            </span>
          </div>
          <div className="flex-1">
            {topic?.letter?.name_english ? (
              <>
                <div className="text-sm font-medium text-gray-900">
                  {topic.letter.name_english}
                </div>
                <div className="text-xs text-gray-600">
                  {showFormSelector ? `${formLabels[selectedForm]} Form` : 'Topic Letter'}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">
                {value ? (showFormSelector ? `Custom Letter • ${formLabels[selectedForm]}` : 'Custom Letter') : 'No letter selected'}
              </div>
            )}
          </div>
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
        onSelect={(selectedLetter: Letter, form?: LetterForm) => {
          onChange(selectedLetter.letter, form);
        }}
        selectedLetter={value}
        selectedForm={selectedForm}
        showFormSelector={showFormSelector}
      />
    </>
  );
}
