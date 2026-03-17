/**
 * I Spy Activity Form
 *
 * Form for configuring the I Spy (Find Letters) activity.
 * Uses target letter + distractors pattern with additional totalLetters config.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, NumberInput } from './FormField';
import { LetterSelector } from './shared/LetterSelector';
import type { LetterReference } from './ArabicLetterGrid';

const DEFAULT_TARGET_COUNT = 5;
const DEFAULT_TOTAL_LETTERS = 12;

export function ISpyActivityForm({
  config,
  onChange,
  topic,
}: BaseActivityFormProps) {
  // Cast config to handle type transitions
  const typedConfig = config as any;

  // Target letter can be single or array of LetterReference
  const targetLetter: LetterReference | LetterReference[] | null = typedConfig?.targetLetter || null;
  // Distractor letters is an array of LetterReference
  const distractorLetters: LetterReference[] = typedConfig?.distractorLetters || [];
  const targetCount: number = typedConfig?.targetCount ?? DEFAULT_TARGET_COUNT;
  const totalLetters: number = typedConfig?.totalLetters ?? DEFAULT_TOTAL_LETTERS;
  const letterSize: string = typedConfig?.letterSize || 'medium';

  const updateConfig = (updates: Record<string, any>) => {
    onChange({ ...config, ...updates } as any);
  };

  return (
    <div className="space-y-4">
      {/* Target Letter */}
      <FormField
        label="Target Letter"
        hint="The letter the child needs to find"
        required
      >
        <LetterSelector
          value={targetLetter}
          onChange={(value) => updateConfig({ targetLetter: value })}
          topic={topic}
          showFormSelector={true}
          multiFormSelect
        />
      </FormField>

      {/* Distractor Letters */}
      <FormField
        label="Distractor Letters"
        hint="Wrong letters to include. Leave empty to use random letters."
      >
        <LetterSelector
          value={distractorLetters}
          onChange={(value) => updateConfig({ distractorLetters: value })}
          multiSelect
          multiFormSelect
        />
      </FormField>

      {/* Counts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Target Count */}
        <FormField
          label="Target Count"
          hint="How many target letters to find"
        >
          <NumberInput
            value={targetCount}
            onChange={(value) => updateConfig({ targetCount: value })}
            min={1}
            max={15}
          />
        </FormField>

        {/* Total Letters */}
        <FormField
          label="Total Letters"
          hint="Total letters on screen"
        >
          <NumberInput
            value={totalLetters}
            onChange={(value) => updateConfig({ totalLetters: value })}
            min={3}
            max={20}
          />
        </FormField>
      </div>

      {/* Letter Size */}
      <FormField
        label="Letter Size"
        hint="Size of letters displayed on screen"
      >
        <select
          value={letterSize}
          onChange={(e) => updateConfig({ letterSize: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </FormField>

      {/* Validation Warning */}
      {targetCount > totalLetters && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
          Warning: Target count cannot exceed total letters on screen.
        </div>
      )}
    </div>
  );
}

export default ISpyActivityForm;
