import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField } from './FormField';
import { LetterSelector } from './shared/LetterSelector';
import { letterFilters, type LetterReference } from './ArabicLetterGrid';
import { cn } from '@/lib/utils';

type LetterForm = 'isolated' | 'initial' | 'medial' | 'final';

export function DragDotsToLetterForm({ config, onChange, topic }: BaseActivityFormProps) {
  // targetLetter is now a LetterReference with form built-in
  const targetLetter: LetterReference | null = config?.targetLetter || null;
  const distractorDotsCount = config?.distractorDotsCount ?? 0;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  // Get the form from the letter reference (defaults to 'isolated')
  const currentForm = targetLetter?.form || 'isolated';

  return (
    <div className="space-y-4">
      <FormField
        label="Target Letter"
        hint="Select a letter with dots that students will complete"
        required
      >
        <LetterSelector
          value={targetLetter}
          onChange={(value) => updateConfig({ targetLetter: value })}
          topic={topic}
          showFormSelector={true}
          letterFilter={letterFilters.withDots}
        />
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
            Please select a target letter to continue
          </p>
        </div>
      )}

      {targetLetter && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Preview:</strong> Students will drag dots to complete the letter in {currentForm} form.
            {distractorDotsCount > 0 && (
              <> The activity includes <strong>{distractorDotsCount}</strong> distractor dot{distractorDotsCount > 1 ? 's' : ''} (gray) that should not be placed.</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
