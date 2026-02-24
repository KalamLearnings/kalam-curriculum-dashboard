'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useLetters, type Letter } from '@/lib/hooks/useLetters';
import { ArabicLetterGrid, type LetterForm } from './forms/ArabicLetterGrid';

interface LetterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (letter: Letter | Letter[], form?: LetterForm) => void;
  selectedLetter?: string | string[]; // Current selected letter(s)
  selectedForm?: LetterForm; // Current selected form
  showFormSelector?: boolean; // Whether to show form selector (default: true for single, false for multi)
  multiSelect?: boolean; // Whether to allow multiple letter selection
  disabledLetters?: string[]; // Letters to disable (e.g., target letter when selecting distractors)
  disabledTooltip?: string; // Tooltip for disabled letters
}

export function LetterSelectorModal({
  isOpen,
  onClose,
  onSelect,
  selectedLetter,
  selectedForm: initialForm = 'isolated',
  showFormSelector,
  multiSelect = false,
  disabledLetters = [],
  disabledTooltip,
}: LetterSelectorModalProps) {
  const { letters, loading } = useLetters();
  const [selected, setSelected] = useState<Letter | Letter[] | null>(null);
  const [selectedForm, setSelectedForm] = useState<LetterForm>(initialForm);

  // Default showFormSelector based on multiSelect (single = show, multi = hide)
  const shouldShowFormSelector = showFormSelector ?? !multiSelect;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (multiSelect) {
        // For multi-select, find all letter objects
        const selectedLetters = Array.isArray(selectedLetter) ? selectedLetter : [];
        const letterObjs = letters.filter(l => selectedLetters.includes(l.letter));
        setSelected(letterObjs);
      } else {
        // For single select, find the letter object
        const letterChar = Array.isArray(selectedLetter) ? selectedLetter[0] : selectedLetter;
        const letterObj = letterChar
          ? letters.find(l => l.letter === letterChar) || null
          : null;
        setSelected(letterObj);
      }
      setSelectedForm(initialForm);
    }
  }, [isOpen, selectedLetter, initialForm, letters, multiSelect]);

  const handleGridChange = (value: string | string[]) => {
    if (multiSelect) {
      const selectedLetters = Array.isArray(value) ? value : [value];
      const letterObjs = letters.filter(l => selectedLetters.includes(l.letter));
      setSelected(letterObjs);
    } else {
      const letter = letters.find(l => l.letter === value);
      if (letter) setSelected(letter);
    }
  };

  const handleSelect = () => {
    if (multiSelect) {
      const selectedArr = selected as Letter[];
      if (selectedArr && selectedArr.length > 0) {
        onSelect(selectedArr, shouldShowFormSelector ? selectedForm : undefined);
        onClose();
      }
    } else {
      const selectedSingle = selected as Letter;
      if (selectedSingle) {
        onSelect(selectedSingle, shouldShowFormSelector ? selectedForm : undefined);
        onClose();
      }
    }
  };

  const getGridValue = () => {
    if (multiSelect) {
      const arr = selected as Letter[] | null;
      return arr ? arr.map(l => l.letter) : [];
    } else {
      const single = selected as Letter | null;
      return single?.letter || '';
    }
  };

  const isValid = multiSelect
    ? (selected as Letter[] | null)?.length && (selected as Letter[]).length > 0
    : selected !== null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={multiSelect ? "Select Letters" : "Select Letter"}
    >
      <div className="p-6">
        {/* Letter Grid with optional Form Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {multiSelect ? "Select Arabic Letters *" : "Select an Arabic Letter *"}
          </label>

          <ArabicLetterGrid
            value={getGridValue()}
            onChange={handleGridChange}
            loading={loading}
            multiSelect={multiSelect}
            showFormSelector={shouldShowFormSelector}
            selectedForm={selectedForm}
            onFormChange={setSelectedForm}
            disabledLetters={disabledLetters}
            disabledTooltip={disabledTooltip}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSelect}
            disabled={!isValid}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {multiSelect ? "Select Letters" : "Select Letter"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
