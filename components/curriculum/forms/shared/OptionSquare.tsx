/**
 * OptionSquare Component
 *
 * A reusable card/tile component for displaying an option (letter, word, or image).
 * Supports correct answer marking, inline editing, and image/letter selection.
 * Used by MultipleChoiceActivityForm, ContentWithCardsActivityForm, etc.
 */

import React, { useState } from 'react';

export interface LetterRef {
  letterId: string;
  form: 'isolated' | 'initial' | 'medial' | 'final';
}

export interface OptionSquareData {
  id: string;
  text?: string;
  letter?: LetterRef;
  image?: string;
  isCorrect?: boolean;
  /** Display character for letter (resolved from letterId) */
  letterDisplay?: string;
}

interface OptionSquareProps {
  /** Option data */
  option: OptionSquareData;
  /** Index for display (1-based) */
  index: number;
  /** Display mode: letter, word, or image */
  mode: 'letter' | 'word' | 'image' | 'text';
  /** Called when correct checkbox is toggled */
  onToggleCorrect?: (checked: boolean) => void;
  /** Called when text is updated (for word mode) */
  onUpdateText?: (value: string) => void;
  /** Called when letter picker should open */
  onOpenLetterPicker?: () => void;
  /** Called when image picker should open */
  onOpenImagePicker?: () => void;
  /** Called when image should be cleared */
  onClearImage?: () => void;
  /** Called when letter should be cleared */
  onClearLetter?: () => void;
  /** Whether to show the correct checkbox */
  showCorrectCheckbox?: boolean;
  /** Placeholder text for empty state */
  placeholder?: string;
}

export function OptionSquare({
  option,
  index,
  mode,
  onToggleCorrect,
  onUpdateText,
  onOpenLetterPicker,
  onOpenImagePicker,
  onClearImage,
  onClearLetter,
  showCorrectCheckbox = true,
  placeholder,
}: OptionSquareProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState(option.text || '');

  // Determine if this is a word/text mode (inline editing)
  const isWordMode = mode === 'word' || mode === 'text';

  // Get appropriate placeholder based on mode
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    switch (mode) {
      case 'letter': return 'أ';
      case 'word':
      case 'text':
        return 'كلمة';
      default: return '';
    }
  };

  const handleSaveText = () => {
    onUpdateText?.(textValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveText();
    } else if (e.key === 'Escape') {
      setTextValue(option.text || '');
      setIsEditing(false);
    }
  };

  const handleClick = () => {
    if (mode === 'letter') {
      onOpenLetterPicker?.();
    } else if (isWordMode) {
      setIsEditing(true);
    } else {
      onOpenImagePicker?.();
    }
  };

  return (
    <div className="relative">
      {/* Correct Answer Checkbox */}
      {showCorrectCheckbox && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <input
            type="checkbox"
            checked={option.isCorrect || false}
            onChange={(e) => onToggleCorrect?.(e.target.checked)}
            className="h-3.5 w-3.5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label className="text-xs text-gray-600">
            {index + 1}
            {option.isCorrect && <span className="ml-1 text-green-600">✓</span>}
          </label>
        </div>
      )}

      {/* Option Content Square */}
      <div
        className={`
          aspect-square border-2 rounded-lg overflow-hidden
          ${option.isCorrect ? 'border-green-400' : 'border-gray-300'}
          bg-gray-50 flex items-center justify-center
          cursor-pointer hover:border-gray-400 transition-colors
        `}
        onClick={handleClick}
      >
        {/* Letter Mode */}
        {mode === 'letter' ? (
          option.letter || option.letterDisplay ? (
            <div className="relative w-full h-full group flex items-center justify-center">
              <div className="text-4xl font-arabic font-semibold text-gray-800" dir="rtl">
                {option.letterDisplay || '?'}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearLetter?.();
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex text-xs"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="text-gray-400 text-xs text-center px-2">
              <div className="text-2xl mb-1 font-arabic">أ</div>
              Click to select
            </div>
          )
        ) : isWordMode ? (
          /* Word/Text Mode */
          isEditing ? (
            <input
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onBlur={handleSaveText}
              onKeyDown={handleKeyDown}
              dir="rtl"
              autoFocus
              className="w-full h-full text-center text-2xl font-semibold bg-white border-2 border-blue-500 outline-none px-1"
              placeholder={getPlaceholder()}
            />
          ) : option.text ? (
            <div className="font-semibold text-gray-800 p-1 text-center text-2xl" dir="rtl">
              {option.text}
            </div>
          ) : (
            <div className="text-gray-400 text-xs text-center px-2">
              Click to add
            </div>
          )
        ) : /* Image Mode */
        option.image ? (
          <div className="relative w-full h-full group">
            <img
              src={option.image}
              alt={`Option ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClearImage?.();
              }}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex text-xs"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="text-gray-400 text-xs text-center px-2">
            <div className="text-2xl mb-1">📸</div>
            Click
          </div>
        )}
      </div>
    </div>
  );
}

export default OptionSquare;
