import React, { useEffect } from 'react';
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
  const targetLetter = config?.targetLetter || '';
  const position = config?.position || 'isolated';
  const distractorPositions = (config?.distractorPositions || []) as string[];

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  // Auto-populate targetLetter from topic when component mounts or topic changes
  useEffect(() => {
    if (!targetLetter && topic?.letter) {
      // Extract letter from topic.letter object (attached by backend)
      const topicLetter = topic.letter.letter;

      // Check if topic letter is in the supported dotted letters list
      if (SUPPORTED_DOTTED_LETTERS.includes(topicLetter as any)) {
        updateConfig({ targetLetter: topicLetter });
      } else {
        // Topic letter not supported, default to 'ب' (ba)
        updateConfig({ targetLetter: 'ب' });
      }
    } else if (!targetLetter) {
      // No topic, default to 'ب' (ba)
      updateConfig({ targetLetter: 'ب' });
    }
  }, [topic, targetLetter]);

  return (
    <div className="space-y-4">
      <FormField
        label="Target Letter"
        hint="Select a letter with dots that students will identify"
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
            ⚠️ Please select a target letter to continue
          </p>
        </div>
      )}

      {targetLetter && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Activity:</strong> Students will see the base letter with multiple dots and tap on the correct dot position(s) for <span className="text-3xl font-arabic">{targetLetter}</span> in {position} form.
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
