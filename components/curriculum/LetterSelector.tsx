/**
 * LetterSelector Component
 *
 * Dropdown selector for Arabic letters with letter forms display
 */

'use client';

import React from 'react';
import { useLetters, type Letter } from '@/lib/hooks/useLetters';

interface LetterSelectorProps {
  value: string; // letter ID like 'alif', 'ba'
  onChange: (letter: Letter | null) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export function LetterSelector({
  value,
  onChange,
  label = 'Select Letter',
  required = false,
  className = '',
}: LetterSelectorProps) {
  const { letters, loading, error } = useLetters();
  const selectedLetter = letters.find(l => l.id === value);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const letterId = e.target.value;
    if (!letterId) {
      onChange(null);
      return;
    }
    const letter = letters.find(l => l.id === letterId);
    if (letter) {
      onChange(letter);
    }
  };

  if (loading) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
          Loading letters...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-700 text-sm">
          Error loading letters: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <select
        value={value}
        onChange={handleChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">-- Select a letter --</option>
        {letters.map((letter) => (
          <option key={letter.id} value={letter.id}>
            {letter.letter} - {letter.name_english} ({letter.transliteration})
          </option>
        ))}
      </select>

      {selectedLetter && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {selectedLetter.name_english}
            </span>
            <span className="text-xs text-gray-500">
              #{selectedLetter.letter_number}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl font-arabic">{selectedLetter.letter}</div>
            <div className="text-sm text-gray-600">
              <div>{selectedLetter.name_arabic}</div>
              <div className="text-xs text-gray-500">{selectedLetter.transliteration}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Isolated:</span>
              <span className="text-2xl font-arabic">{selectedLetter.forms.isolated}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Initial:</span>
              <span className="text-2xl font-arabic">{selectedLetter.forms.initial}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Medial:</span>
              <span className="text-2xl font-arabic">{selectedLetter.forms.medial}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Final:</span>
              <span className="text-2xl font-arabic">{selectedLetter.forms.final}</span>
            </div>
          </div>

          {selectedLetter.phonetics?.englishApproximation && (
            <div className="mt-2 text-xs text-gray-600 pt-2 border-t border-gray-200">
              <strong>Pronunciation:</strong> {selectedLetter.phonetics.englishApproximation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
