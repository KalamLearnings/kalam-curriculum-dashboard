'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useLetters, type Letter } from '@/lib/hooks/useLetters';
import { ArabicLetterGrid, type LetterForm } from './forms/ArabicLetterGrid';

interface LetterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (letter: Letter, form?: LetterForm) => void;
  selectedLetter?: string; // Current selected letter character
  selectedForm?: LetterForm; // Current selected form
  showFormSelector?: boolean; // Whether to show form selector (default: true)
}

export function LetterSelectorModal({
  isOpen,
  onClose,
  onSelect,
  selectedLetter,
  selectedForm: initialForm = 'isolated',
  showFormSelector = true,
}: LetterSelectorModalProps) {
  const { letters, loading } = useLetters();
  const [selected, setSelected] = useState<Letter | null>(null);
  const [selectedForm, setSelectedForm] = useState<LetterForm>(initialForm);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      // Find the letter object if we have a selectedLetter
      const letterObj = selectedLetter
        ? letters.find(l => l.letter === selectedLetter) || null
        : null;
      setSelected(letterObj);
      setSelectedForm(initialForm);
    }
  }, [isOpen, selectedLetter, initialForm, letters]);

  const handleSelect = () => {
    if (selected) {
      onSelect(selected, showFormSelector ? selectedForm : undefined);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Letter"
    >
      <div className="p-6">
        {/* Letter Grid with optional Form Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select an Arabic Letter *
          </label>

          <ArabicLetterGrid
            value={selected?.letter || ''}
            onChange={(value) => {
              const letter = letters.find(l => l.letter === value);
              if (letter) setSelected(letter);
            }}
            loading={loading}
            showFormSelector={showFormSelector}
            selectedForm={selectedForm}
            onFormChange={setSelectedForm}
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
            disabled={!selected}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select Letter
          </button>
        </div>
      </div>
    </Modal>
  );
}
