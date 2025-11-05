import React, { useState } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField } from './FormField';
import { cn } from '@/lib/utils';

/**
 * Letters that are supported for this activity (letters with dots)
 */
const SUPPORTED_DOTTED_LETTERS = [
  'ب', 'ت', 'ث',  // Ba family
  'ج', 'خ',      // Jeem family
  'ذ',           // Dal family
  'ز',           // Ra family
  'ش',           // Seen family
  'ض',           // Sad family
  'ظ',           // Tah family
  'غ',           // Ain family
  'ف', 'ق',      // Fa/Qaf
  'ن',           // Noon
  'ي',           // Ya
] as const;

export function DragDotsToLetterForm({ config, onChange, topic }: BaseActivityFormProps) {
  const targetLetter = config?.targetLetter || '';
  const position = config?.position || 'isolated';
  const distractorDotsCount = config?.distractorDotsCount ?? 0;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <FormField
        label="Target Letter"
        hint="Select a letter with dots that students will complete"
        required
      >
        <div className="grid grid-cols-6 gap-2">
          {SUPPORTED_DOTTED_LETTERS.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => updateConfig({ targetLetter: letter })}
              className={cn(
                'aspect-square flex items-center justify-center text-4xl font-arabic rounded-lg border-2 transition-all hover:scale-105',
                targetLetter === letter
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              )}
            >
              {letter}
            </button>
          ))}
        </div>
      </FormField>

      <FormField
        label="Letter Position"
        hint="Form of the letter (affects appearance in Arabic)"
      >
        <div className="grid grid-cols-4 gap-2">
          {(['isolated', 'initial', 'medial', 'final'] as const).map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => updateConfig({ position: pos })}
              className={cn(
                'px-4 py-3 rounded-lg border-2 text-sm font-medium capitalize transition-all',
                position === pos
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-gray-50'
              )}
            >
              {pos}
            </button>
          ))}
        </div>
      </FormField>

      <FormField
        label="Distractor Dots"
        hint="Number of extra incorrect dots to make the activity harder (0-5)"
      >
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="5"
            value={distractorDotsCount}
            onChange={(e) => updateConfig({ distractorDotsCount: parseInt(e.target.value) })}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex items-center justify-center w-16 h-10 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <span className="text-lg font-bold text-blue-700">{distractorDotsCount}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {distractorDotsCount === 0 && 'No distractor dots - only correct dots shown'}
          {distractorDotsCount === 1 && '1 extra incorrect dot - slightly harder'}
          {distractorDotsCount >= 2 && `${distractorDotsCount} extra incorrect dots - more challenging`}
        </p>
      </FormField>

      {!targetLetter && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Please select a target letter to continue
          </p>
        </div>
      )}

      {targetLetter && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Preview:</strong> Students will drag dots to complete the letter <span className="text-3xl font-arabic">{targetLetter}</span> in {position} form.
            {distractorDotsCount > 0 && (
              <> The activity includes <strong>{distractorDotsCount}</strong> distractor dot{distractorDotsCount > 1 ? 's' : ''} (gray) that should not be placed.</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
