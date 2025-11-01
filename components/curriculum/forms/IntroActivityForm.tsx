import React, { useState, useEffect } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput } from './FormField';
import { PositionSelector } from './PositionSelector';
import { WordSelector } from '../WordSelector';
import { ActivityWordStatus } from '@/components/words/ActivityWordStatus';
import { LetterSelectorModal } from '../LetterSelectorModal';
import { ImageLibraryModal } from './ImageLibraryModal';
import type { Letter } from '@/lib/hooks/useLetters';
import { cn } from '@/lib/utils';

export function IntroActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  const contentType = config?.contentType || 'letter';
  const letter = config?.letter || '';
  const word = config?.word || '';
  const image = config?.image || '';
  const imageWidth = config?.imageWidth || 300;
  const imageHeight = config?.imageHeight || 300;
  const position = config?.position || 'standalone';

  const [showLetterSelector, setShowLetterSelector] = useState(false);
  const [showImageLibrary, setShowImageLibrary] = useState(false);

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  // Auto-populate letter from topic when component mounts or topic changes
  useEffect(() => {
    if (topic && contentType === 'letter') {
      // Extract letter from topic metadata
      const topicLetter = topic.metadata?.reference?.character;
      if (topicLetter && !letter) {
        updateConfig({ letter: topicLetter });
      }
    }
  }, [topic, contentType, letter]);

  return (
    <div className="space-y-4">

      <FormField label="Content Type" hint="Show a letter, word, or image" required>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => updateConfig({ contentType: 'letter' })}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              contentType === 'letter'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            )}
          >
            <div className="text-3xl font-arabic">أ</div>
            <div className="text-xs font-medium text-gray-600">Letter</div>
          </button>

          <button
            type="button"
            onClick={() => updateConfig({ contentType: 'word' })}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              contentType === 'word'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            )}
          >
            <div className="text-3xl font-arabic">كلمة</div>
            <div className="text-xs font-medium text-gray-600">Word</div>
          </button>

          <button
            type="button"
            onClick={() => updateConfig({ contentType: 'image' })}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              contentType === 'image'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            )}
          >
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="text-xs font-medium text-gray-600">Image</div>
          </button>
        </div>
      </FormField>

      {contentType === 'letter' && (
        <FormField label="Letter" hint="Letter from current topic" required>
          <div className="flex items-center gap-3">
            {/* Letter Display Card */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg flex-1">
              <div className="flex items-center justify-center w-16 h-16 bg-white rounded-lg shadow-sm border border-blue-100">
                <span className="text-4xl font-arabic text-blue-900">
                  {letter || '—'}
                </span>
              </div>
              <div className="flex-1">
                {topic && topic.metadata?.reference?.name_english ? (
                  <>
                    <div className="text-sm font-medium text-gray-900">
                      {topic.metadata.reference.name_english}
                    </div>
                    <div className="text-xs text-gray-600">
                      Topic Letter • {topic.metadata.reference.form ? `${topic.metadata.reference.form.charAt(0).toUpperCase() + topic.metadata.reference.form.slice(1)} Form` : 'All Forms'}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    {letter ? 'Custom Letter' : 'No letter selected'}
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
        </FormField>
      )}

      {contentType === 'word' && (
        <>
          <WordSelector
            value={word}
            onChange={(wordValue) => updateConfig({ word: wordValue })}
            label="Word"
            required
          />
          {word && (
            <ActivityWordStatus
              words={[{ arabic: word }]}
            />
          )}
        </>
      )}

      {contentType === 'image' && (
        <>
          <FormField label="Image" hint="Image to display" required>
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
                    onClick={() => setShowImageLibrary(true)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={() => updateConfig({ image: '' })}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowImageLibrary(true)}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors w-full max-w-xs"
              >
                <div className="text-4xl mb-2">🖼️</div>
                <p className="text-sm text-gray-600">Click to select image</p>
              </button>
            )}
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Image Width" hint="Width in pixels (optional)">
              <TextInput
                value={imageWidth?.toString() || ''}
                onChange={(value) => updateConfig({ imageWidth: value ? parseInt(value) : undefined })}
                placeholder="300"
                type="number"
              />
            </FormField>

            <FormField label="Image Height" hint="Height in pixels (optional)">
              <TextInput
                value={imageHeight?.toString() || ''}
                onChange={(value) => updateConfig({ imageHeight: value ? parseInt(value) : undefined })}
                placeholder="300"
                type="number"
              />
            </FormField>
          </div>
        </>
      )}

      <FormField label="Position" hint="Position of letter in word context">
        <PositionSelector
          value={position}
          onChange={(value) => updateConfig({ position: value })}
          targetLetter={letter}
        />
      </FormField>

      {/* Letter Selector Modal */}
      <LetterSelectorModal
        isOpen={showLetterSelector}
        onClose={() => setShowLetterSelector(false)}
        onSelect={(selectedLetter: Letter) => {
          updateConfig({ letter: selectedLetter.letter });
        }}
        selectedLetter={letter}
      />

      {/* Image Library Modal */}
      <ImageLibraryModal
        isOpen={showImageLibrary}
        onClose={() => setShowImageLibrary(false)}
        onSelectImage={(url: string) => {
          updateConfig({ image: url });
          setShowImageLibrary(false);
        }}
        currentImage={image}
      />
    </div>
  );
}
