import React, { useState } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput } from './FormField';
import { LetterSelector } from './shared/LetterSelector';
import { WordSelector } from '../WordSelector';
import { ActivityWordStatus } from '@/components/words/ActivityWordStatus';
import { ImageLibraryModal } from './ImageLibraryModal';
import { cn } from '@/lib/utils';
import type { LetterReference } from './ArabicLetterGrid';

export function IntroActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  // Note: config type from @kalam/curriculum-schemas still expects old format
  // We're migrating to LetterReference format
  const typedConfig = config as any;
  const contentType = typedConfig?.contentType || 'letter';
  // letter is now a LetterReference object that includes the form
  const letter: LetterReference | null = typedConfig?.letter || null;
  const word = typedConfig?.word || '';
  const image = typedConfig?.image || '';
  const imageWidth = typedConfig?.imageWidth || 300;
  const imageHeight = typedConfig?.imageHeight || 300;

  const [showImageLibrary, setShowImageLibrary] = useState(false);

  const updateConfig = (updates: Record<string, any>) => {
    onChange({ ...config, ...updates } as any);
  };

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
        <FormField label="Letter" hint="Select letter and form to display" required>
          <LetterSelector
            value={letter}
            onChange={(value) => updateConfig({ letter: value })}
            topic={topic}
            showFormSelector={true}
          />
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
