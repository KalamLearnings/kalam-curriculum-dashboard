/**
 * ContentDisplayPicker Component
 *
 * A reusable component for selecting content to display (letter, word, or image).
 * Handles the UI for text input or image selection with preview.
 * Used by MultipleChoiceActivityForm, ContentWithCardsActivityForm, IntroActivityForm, etc.
 */

import React, { useState } from 'react';
import { FormField, TextInput } from '../FormField';
import { ImageLibraryModal } from '../ImageLibraryModal';

export type ContentType = 'letter' | 'word' | 'image';

interface ContentDisplayPickerProps {
  /** Current content type */
  contentType: ContentType;
  /** Letter value (when contentType is 'letter') */
  letter?: string;
  /** Word value (when contentType is 'word') */
  word?: string;
  /** Image URL (when contentType is 'image') */
  image?: string;
  /** Called when letter changes */
  onLetterChange?: (value: string) => void;
  /** Called when word changes */
  onWordChange?: (value: string) => void;
  /** Called when image changes */
  onImageChange?: (url: string) => void;
  /** Placeholder for letter input */
  letterPlaceholder?: string;
  /** Placeholder for word input */
  wordPlaceholder?: string;
  /** Label for the field */
  label?: string;
  /** Hint text */
  hint?: string;
}

export function ContentDisplayPicker({
  contentType,
  letter = '',
  word = '',
  image = '',
  onLetterChange,
  onWordChange,
  onImageChange,
  letterPlaceholder = 'أ',
  wordPlaceholder = 'كلمة',
  label,
  hint,
}: ContentDisplayPickerProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const handleImageSelect = (url: string) => {
    onImageChange?.(url);
    setImageModalOpen(false);
  };

  if (contentType === 'letter') {
    return (
      <FormField label={label || "Letter"} hint={hint || "Single letter to display"}>
        <TextInput
          value={letter}
          onChange={(value) => onLetterChange?.(value)}
          placeholder={letterPlaceholder}
          dir="rtl"
        />
      </FormField>
    );
  }

  if (contentType === 'word') {
    return (
      <FormField label={label || "Word"} hint={hint || "Word to display"}>
        <TextInput
          value={word}
          onChange={(value) => onWordChange?.(value)}
          placeholder={wordPlaceholder}
          dir="rtl"
        />
      </FormField>
    );
  }

  // Image content type
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label || "Image"}
        </label>
        {image ? (
          <div className="relative inline-block">
            <img
              src={image}
              alt="Display"
              className="max-w-xs max-h-48 rounded-lg border-2 border-gray-200"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setImageModalOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Change Image
              </button>
              <button
                type="button"
                onClick={() => onImageChange?.('')}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setImageModalOpen(true)}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors w-full max-w-xs"
          >
            <div className="text-4xl mb-2">🖼️</div>
            <p className="text-sm text-gray-600">Click to select image</p>
          </button>
        )}
      </div>

      <ImageLibraryModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSelectImage={handleImageSelect}
        currentImage={image}
      />
    </>
  );
}

export default ContentDisplayPicker;
