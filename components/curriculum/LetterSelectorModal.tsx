'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useLetters, type Letter } from '@/lib/hooks/useLetters';
import { ArabicLetterGrid, type LetterForm, type LetterReference, type LetterWithForms, type LetterFilterFn } from './forms/ArabicLetterGrid';

interface LetterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: LetterReference | LetterReference[]) => void;
  /** Current selected value (LetterReference format) */
  selectedValue?: LetterReference | LetterReference[] | null;
  /** Whether to show form selector */
  showFormSelector?: boolean;
  /** Whether to allow multiple letter selection */
  multiSelect?: boolean;
  /** Whether to allow multiple forms per letter (requires multiSelect) */
  multiFormSelect?: boolean;
  /** Letter IDs to disable (e.g., target letter when selecting distractors) */
  disabledLetterIds?: string[];
  /** Tooltip for disabled letters */
  disabledTooltip?: string;
  /** Filter function to show only specific letters */
  letterFilter?: LetterFilterFn;
}

export function LetterSelectorModal({
  isOpen,
  onClose,
  onSelect,
  selectedValue,
  showFormSelector = true,
  multiSelect = false,
  multiFormSelect = false,
  disabledLetterIds = [],
  disabledTooltip,
  letterFilter,
}: LetterSelectorModalProps) {
  const { letters, loading } = useLetters();

  // Internal state for the grid - uses LetterReference format
  const [gridValue, setGridValue] = useState<LetterReference | LetterReference[] | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setGridValue(selectedValue ?? null);
    }
  }, [isOpen, selectedValue]);

  const handleGridChange = (value: LetterReference | LetterReference[] | null) => {
    setGridValue(value);
  };

  const handleSelect = () => {
    if (!gridValue) return;

    if (multiSelect) {
      const refs = Array.isArray(gridValue) ? gridValue : [gridValue];
      if (refs.length > 0) {
        onSelect(refs);
        onClose();
      }
    } else {
      const ref = Array.isArray(gridValue) ? gridValue[0] : gridValue;
      if (ref) {
        onSelect(ref);
        onClose();
      }
    }
  };

  const isValid = (() => {
    if (!gridValue) return false;
    if (Array.isArray(gridValue)) return gridValue.length > 0;
    return true;
  })();

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
            value={gridValue}
            onChange={handleGridChange}
            loading={loading}
            multiSelect={multiSelect}
            multiFormSelect={multiFormSelect}
            showFormSelector={showFormSelector}
            disabledLetterIds={disabledLetterIds}
            disabledTooltip={disabledTooltip}
            letterFilter={letterFilter}
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
