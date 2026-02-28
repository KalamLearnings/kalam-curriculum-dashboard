import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField } from './FormField';
import { LetterSelector } from './shared/LetterSelector';
import { letterFilters, type LetterReference } from './ArabicLetterGrid';
import { useLetters } from '@/lib/hooks/useLetters';
import { cn } from '@/lib/utils';
import type { HamzaPosition } from '@/lib/types/activity-configs';

/**
 * Hamza positions with labels
 */
const HAMZA_POSITIONS: { value: HamzaPosition; label: string; example: string }[] = [
  { value: 'above', label: 'Above', example: 'أ' },
  { value: 'below', label: 'Below', example: 'إ' },
  { value: 'on_line', label: 'On Line', example: 'ء' },
];

/**
 * Mapping of letter + position to result character
 */
const HAMZA_RESULTS: Record<string, Record<HamzaPosition, string>> = {
  'alif': { above: 'أ', below: 'إ', on_line: 'ء' },
  'waw': { above: 'ؤ', below: 'ء', on_line: 'ء' },
  'ya': { above: 'ئ', below: 'ء', on_line: 'ء' },
};

export function DragHamzaToLetterForm({ config, onChange, topic }: BaseActivityFormProps) {
  const { letters } = useLetters();

  // targetLetter is now a LetterReference
  const targetLetter: LetterReference | null = config?.targetLetter || null;
  const correctPosition: HamzaPosition = config?.correctPosition || 'above';

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  // Get the result letter with hamza based on letterId
  const getResultLetter = (letterId: string, position: HamzaPosition): string => {
    return HAMZA_RESULTS[letterId]?.[position] || 'ء';
  };

  // Get the display character for the target letter
  const getLetterDisplay = (): string => {
    if (!targetLetter) return '';
    const letterData = letters.find(l => l.id === targetLetter.letterId);
    return letterData?.letter || '';
  };

  return (
    <div className="space-y-4">
      <FormField
        label="Target Letter"
        hint="Select the letter to place hamza on (Alif, Waw, or Ya)"
        required
      >
        <LetterSelector
          value={targetLetter}
          onChange={(value) => updateConfig({ targetLetter: value })}
          topic={topic}
          showFormSelector={false}
          letterFilter={letterFilters.hamzaCarriers}
        />
      </FormField>

      <FormField
        label="Correct Hamza Position"
        hint="Where the hamza should be placed"
        required
      >
        <div className="grid grid-cols-3 gap-3">
          {HAMZA_POSITIONS.map((pos) => (
            <button
              key={pos.value}
              type="button"
              onClick={() => updateConfig({ correctPosition: pos.value })}
              className={cn(
                'flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all',
                correctPosition === pos.value
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              )}
            >
              <span className="text-4xl font-arabic mb-2">{pos.example}</span>
              <span className="text-sm font-medium text-gray-700">{pos.label}</span>
            </button>
          ))}
        </div>
      </FormField>

      {targetLetter && correctPosition && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Preview:</strong> Students will drag the hamza symbol (ء) to place it{' '}
            <strong>{correctPosition === 'above' ? 'above' : correctPosition === 'below' ? 'below' : 'on the line of'}</strong>{' '}
            the letter <span className="text-3xl font-arabic">{getLetterDisplay()}</span> to create{' '}
            <span className="text-3xl font-arabic">{getResultLetter(targetLetter.letterId, correctPosition)}</span>
          </p>
        </div>
      )}
    </div>
  );
}
