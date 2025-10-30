'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useLetters, type Letter } from '@/lib/hooks/useLetters';

interface LetterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (letter: Letter) => void;
  selectedLetter?: string; // Current selected letter character
}

export function LetterSelectorModal({
  isOpen,
  onClose,
  onSelect,
  selectedLetter,
}: LetterSelectorModalProps) {
  const { letters, loading } = useLetters();
  const [selected, setSelected] = useState<Letter | null>(null);

  const handleSelect = () => {
    if (selected) {
      onSelect(selected);
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
        {/* Letter Grid */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select an Arabic Letter *
          </label>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading letters...</div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {letters.map((letter) => (
                <button
                  key={letter.id}
                  type="button"
                  onClick={() => setSelected(letter)}
                  className={`
                    aspect-square rounded-lg border-2 transition-all
                    flex flex-col items-center justify-center
                    hover:border-blue-400 hover:bg-blue-50
                    ${
                      selected?.id === letter.id || selectedLetter === letter.letter
                        ? 'border-blue-600 bg-blue-100 ring-2 ring-blue-600 ring-offset-2'
                        : 'border-gray-300 bg-white'
                    }
                  `}
                >
                  <div className="text-3xl font-arabic mb-1">{letter.letter}</div>
                  <div className="text-xs text-gray-600">{letter.name_english}</div>
                </button>
              ))}
            </div>
          )}
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
