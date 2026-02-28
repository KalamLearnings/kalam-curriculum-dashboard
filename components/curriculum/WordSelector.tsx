/**
 * WordSelector Component
 *
 * Allows selecting existing words from the word library or entering a new word
 * Shows word details including letter composition and asset status
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useWords, type Word } from '@/lib/hooks/useWords';

interface WordSelectorProps {
  value: string; // Arabic word text
  onChange: (word: string, wordData?: Word) => void;
  label?: string;
  required?: boolean;
  showTranslation?: boolean;
  onTranslationChange?: (translation: string) => void;
  translationValue?: string;
  className?: string;
}

export function WordSelector({
  value,
  onChange,
  label = 'Word',
  required = false,
  showTranslation = false,
  onTranslationChange,
  translationValue = '',
  className = '',
}: WordSelectorProps) {
  const { words, loading, error } = useWords();
  const [inputValue, setInputValue] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Find if the current value matches an existing word
  const selectedWord = words.find(w => w.arabic === value);

  // Filter words based on input
  const filteredWords = inputValue.trim()
    ? words.filter(word =>
        word.arabic.includes(inputValue) ||
        word.english?.toLowerCase().includes(inputValue.toLowerCase()) ||
        word.transliteration?.toLowerCase().includes(inputValue.toLowerCase())
      )
    : [];

  // Check if input exactly matches an existing word
  const exactMatch = words.find(w => w.arabic === inputValue);

  // Sync input value with prop value - always sync when value changes externally
  useEffect(() => {
    // This handles both initial load and when parent updates the value
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setShowDropdown(true);
    setFocusedIndex(-1);
    // Don't call onChange yet - wait for selection or explicit confirmation
  };

  const handleSelectWord = (word: Word) => {
    setInputValue(word.arabic);
    onChange(word.arabic, word);
    if (showTranslation && onTranslationChange && word.english) {
      onTranslationChange(word.english);
    }
    setShowDropdown(false);
    setFocusedIndex(-1);
  };

  const handleInputBlur = () => {
    // Delay to allow click on dropdown
    setTimeout(() => {
      setShowDropdown(false);
      // If user typed something that doesn't match, still update the value
      if (inputValue !== value) {
        onChange(inputValue);
      }
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || filteredWords.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev =>
          prev < filteredWords.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) {
          handleSelectWord(filteredWords[focusedIndex]);
        } else if (filteredWords.length === 1) {
          handleSelectWord(filteredWords[0]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setFocusedIndex(-1);
        break;
    }
  };

  if (loading && words.length === 0) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
          Loading words...
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

      {error && (
        <div className="mb-2 px-3 py-2 border border-yellow-300 rounded-md bg-yellow-50 text-yellow-800 text-sm">
          {error} - You can still enter words manually.
        </div>
      )}

      {/* Autocomplete Input */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          required={required}
          placeholder="Type to search or enter new word..."
          dir="rtl"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl"
        />

        {/* Autocomplete Dropdown */}
        {showDropdown && filteredWords.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredWords.map((word, index) => (
              <button
                key={word.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectWord(word);
                }}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center justify-between ${
                  index === focusedIndex ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="text-lg font-arabic">{word.arabic}</div>
                  {(word.transliteration || word.english) && (
                    <div className="text-xs text-gray-600">
                      {word.transliteration && `${word.transliteration}`}
                      {word.transliteration && word.english && ' • '}
                      {word.english}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  {word.has_image && (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                      ✓ Image
                    </span>
                  )}
                  {word.has_audio && (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                      ✓ Audio
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Hint Text */}
        <p className="mt-1 text-xs text-gray-500">
          {filteredWords.length > 0
            ? `${filteredWords.length} word${filteredWords.length === 1 ? '' : 's'} found - select one or keep typing to add new`
            : inputValue.trim()
            ? 'New word - will be added to library when saved'
            : `${words.length} words in library`}
        </p>
      </div>

      {/* Show Translation Input */}
      {showTranslation && onTranslationChange && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Word Meaning / Translation
          </label>
          <input
            type="text"
            value={translationValue}
            onChange={(e) => onTranslationChange(e.target.value)}
            placeholder="Lion"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            This will be converted to audio and played in the app
          </p>
        </div>
      )}

      {/* Selected Word Details */}
      {selectedWord && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-2xl font-arabic mb-1">{selectedWord.arabic}</div>
              {selectedWord.transliteration && (
                <div className="text-sm text-gray-600">{selectedWord.transliteration}</div>
              )}
              {selectedWord.english && (
                <div className="text-sm text-gray-600">{selectedWord.english}</div>
              )}
            </div>
            <div className="flex gap-1">
              {selectedWord.has_image ? (
                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                  ✓ Image
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded">
                  No Image
                </span>
              )}
              {selectedWord.has_audio ? (
                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                  ✓ Audio
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded">
                  No Audio
                </span>
              )}
            </div>
          </div>

          {/* Letter Composition */}
          {selectedWord.letter_composition && selectedWord.letter_composition.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-700 mb-1">Letter Composition:</div>
              <div className="flex flex-wrap gap-1">
                {selectedWord.letter_composition.map((comp, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs"
                  >
                    <span className="font-arabic text-base">{comp.character}</span>
                    <span className="text-gray-500">
                      {comp.letter_id} ({comp.form})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Usage Info */}
          <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
            <span>Used in {selectedWord.usage_count} activities</span>
            {selectedWord.difficulty && <span>Difficulty: {selectedWord.difficulty}</span>}
          </div>
        </div>
      )}

      {/* New Word Info */}
      {!selectedWord && value && !exactMatch && (
        <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1 text-sm text-blue-800">
              <strong className="font-arabic text-base">{value}</strong> will be added to the word library when you save this activity.
              The system will automatically analyze its letter composition.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
