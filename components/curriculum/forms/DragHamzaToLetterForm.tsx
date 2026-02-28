import React, { useEffect } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField } from './FormField';
import { cn } from '@/lib/utils';
import type { DragHamzaToLetterConfig, HamzaPosition } from '@/lib/types/activity-configs';

/**
 * Letters that can receive hamza
 * Note: Ya is shown without dots (ى) because when hamza is placed on ya,
 * it becomes ئ which has no dots underneath
 */
const HAMZA_LETTERS = [
  'ا', // Alif (most common)
  'و', // Waw
  'ى', // Ya (dotless form - hamza ya ئ has no dots)
] as const;

/**
 * Hamza positions with labels
 */
const HAMZA_POSITIONS: { value: HamzaPosition; label: string; example: string }[] = [
  { value: 'above', label: 'Above', example: 'أ' },
  { value: 'below', label: 'Below', example: 'إ' },
  { value: 'on_line', label: 'On Line', example: 'ء' },
];

export function DragHamzaToLetterForm({ config, onChange, topic }: BaseActivityFormProps<DragHamzaToLetterConfig>) {
  const targetLetter = config?.targetLetter || 'ا';
  const correctPosition = config?.correctPosition || 'above';

  const updateConfig = (updates: Partial<DragHamzaToLetterConfig>) => {
    onChange({ ...config, ...updates });
  };

  // Auto-set default values on mount
  useEffect(() => {
    if (!config?.targetLetter) {
      updateConfig({ targetLetter: 'ا', correctPosition: 'above', showAllPositions: false });
    }
  }, []);

  // Get the result letter with hamza
  const getResultLetter = (letter: string, position: HamzaPosition): string => {
    if (letter === 'ا') {
      switch (position) {
        case 'above': return 'أ';
        case 'below': return 'إ';
        case 'on_line': return 'ء';
      }
    }
    if (letter === 'و') {
      switch (position) {
        case 'above': return 'ؤ';
        default: return 'ء';
      }
    }
    if (letter === 'ى') {
      switch (position) {
        case 'above': return 'ئ'; // Hamza on ya is placed above
        default: return 'ء';
      }
    }
    return 'ء';
  };

  return (
    <div className="space-y-4">
      <FormField
        label="Target Letter"
        hint="Select the letter to place hamza on"
        required
      >
        <div className="grid grid-cols-3 gap-3">
          {HAMZA_LETTERS.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => updateConfig({ targetLetter: letter })}
              className={cn(
                'aspect-square flex items-center justify-center text-5xl font-arabic rounded-lg border-2 transition-all hover:scale-105',
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
            the letter <span className="text-3xl font-arabic">{targetLetter}</span> to create{' '}
            <span className="text-3xl font-arabic">{getResultLetter(targetLetter, correctPosition)}</span>
          </p>
        </div>
      )}
    </div>
  );
}
