import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField } from './FormField';
import { LetterSelector } from './shared/LetterSelector';
import { letterFilters, type LetterReference } from './ArabicLetterGrid';
import { cn } from '@/lib/utils';

/**
 * Available dot positions
 */
const DOT_POSITIONS = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'middle', label: 'Middle' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
] as const;

export function TapDotPositionForm({ config, onChange, topic }: BaseActivityFormProps) {
  // targetLetter is now a LetterReference with form built-in
  const targetLetter: LetterReference | null = config?.targetLetter || null;
  const distractorPositions = (config?.distractorPositions || []) as string[];

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  // Get the form from the letter reference (defaults to 'isolated')
  const currentForm = targetLetter?.form || 'isolated';

  return (
    <div className="space-y-4">
      <FormField
        label="Target Letter"
        hint="Select a letter with dots that students will identify"
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
        label="Distractor Dot Positions"
        hint="Select which positions should show incorrect dots"
      >
        <div className="grid grid-cols-3 gap-2">
          {DOT_POSITIONS.map((pos) => {
            const isSelected = distractorPositions.includes(pos.value);
            return (
              <button
                key={pos.value}
                type="button"
                onClick={() => {
                  const updated = isSelected
                    ? distractorPositions.filter((p) => p !== pos.value)
                    : [...distractorPositions, pos.value];
                  updateConfig({ distractorPositions: updated });
                }}
                className={cn(
                  'px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                  isSelected
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                {pos.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {distractorPositions.length === 0 && 'No distractor positions selected - only correct dots will show'}
          {distractorPositions.length === 1 && '1 distractor position selected - easier'}
          {distractorPositions.length === 2 && '2 distractor positions selected - moderate'}
          {distractorPositions.length >= 3 && `${distractorPositions.length} distractor positions selected - challenging`}
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
            <strong>Activity:</strong> Students will see the base letter with multiple dots and tap on the correct dot position(s) in {currentForm} form.
            {distractorPositions.length > 0 && (
              <> Distractor dots will appear at: <strong>{distractorPositions.join(', ')}</strong>.</>
            )}
            {distractorPositions.length === 0 && (
              <> No distractor dots - only the correct position(s) will be shown.</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
