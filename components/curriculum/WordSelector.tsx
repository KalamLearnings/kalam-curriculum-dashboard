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
  const [mode, setMode] = useState<'select' | 'manual'>('select');
  const [searchQuery, setSearchQuery] = useState('');

  // Find if the current value matches an existing word
  const selectedWord = words.find(w => w.arabic === value);

  // Filter words based on search
  const filteredWords = words.filter(word =>
    word.arabic.includes(searchQuery) ||
    word.english?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.transliteration?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-switch to manual mode if value doesn't match any word
  useEffect(() => {
    if (value && !selectedWord && words.length > 0) {
      setMode('manual');
    }
  }, [value, selectedWord, words.length]);

  const handleSelectWord = (wordId: string) => {
    if (!wordId) {
      onChange('');
      return;
    }
    const word = words.find(w => w.id === wordId);
    if (word) {
      onChange(word.arabic, word);
      if (showTranslation && onTranslationChange && word.english) {
        onTranslationChange(word.english);
      }
    }
  };

  const handleManualInput = (text: string) => {
    onChange(text);
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

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode('select')}
          className={`px-3 py-1 text-sm rounded-md ${
            mode === 'select'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Select from Library ({words.length})
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`px-3 py-1 text-sm rounded-md ${
            mode === 'manual'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Enter New Word
        </button>
      </div>

      {error && (
        <div className="mb-2 px-3 py-2 border border-yellow-300 rounded-md bg-yellow-50 text-yellow-800 text-sm">
          {error} - You can still enter words manually.
        </div>
      )}

      {mode === 'select' ? (
        <>
          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words..."
            className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Word Dropdown */}
          <select
            value={selectedWord?.id || ''}
            onChange={(e) => handleSelectWord(e.target.value)}
            required={required && mode === 'select'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            size={Math.min(filteredWords.length + 1, 8)}
          >
            <option value="">-- Select a word --</option>
            {filteredWords.map((word) => (
              <option key={word.id} value={word.id}>
                {word.arabic}
                {word.transliteration && ` (${word.transliteration})`}
                {word.english && ` - ${word.english}`}
              </option>
            ))}
          </select>

          {filteredWords.length === 0 && searchQuery && (
            <p className="mt-2 text-sm text-gray-500">
              No words found. Try entering a new word manually.
            </p>
          )}
        </>
      ) : (
        <>
          {/* Manual Input */}
          <input
            type="text"
            value={value}
            onChange={(e) => handleManualInput(e.target.value)}
            required={required && mode === 'manual'}
            placeholder="أسد"
            dir="rtl"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter Arabic word text. It will be auto-analyzed and added to the word library when you save this activity.
          </p>
        </>
      )}

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
      {!selectedWord && value && mode === 'manual' && (
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
