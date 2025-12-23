/**
 * TapActivityBaseForm - Shared form component for tap-based activities
 *
 * Provides common configuration fields for activities where users tap
 * on items containing target letters.
 */

import React from 'react';
import { FormField, NumberInput } from '../FormField';
import { LetterSelector } from '../../LetterSelector';

export interface TapActivityConfig {
  targetLetter: string;
  distractorLetters?: string[];
  targetCount?: number;
  totalItems?: number;
}

interface TapActivityBaseFormProps<T extends TapActivityConfig> {
  config: Partial<T>;
  onChange: (config: Partial<T>) => void;
  itemLabel?: string; // e.g., "fruits", "flowers", "moons"
  defaultTargetCount?: number;
  defaultTotalItems?: number;
  children?: React.ReactNode; // For activity-specific fields
}

export function TapActivityBaseForm<T extends TapActivityConfig>({
  config,
  onChange,
  itemLabel = 'items',
  defaultTargetCount = 4,
  defaultTotalItems = 8,
  children,
}: TapActivityBaseFormProps<T>) {
  const distractors = config.distractorLetters || [];

  const handleChange = <K extends keyof T>(key: K, value: T[K]) => {
    onChange({ ...config, [key]: value });
  };

  const addDistractor = (letter: any) => {
    if (letter && !distractors.includes(letter.id)) {
      handleChange('distractorLetters' as keyof T, [...distractors, letter.id] as T[keyof T]);
    }
  };

  const removeDistractor = (letterId: string) => {
    handleChange(
      'distractorLetters' as keyof T,
      distractors.filter((d) => d !== letterId) as T[keyof T]
    );
  };

  return (
    <div className="space-y-6">
      <FormField label="Target Letter" hint="The letter students need to find" required>
        <LetterSelector
          value={config.targetLetter || ''}
          onChange={(letter) => handleChange('targetLetter' as keyof T, letter?.id as T[keyof T])}
        />
      </FormField>

      <FormField label="Distractor Letters" hint="Additional letters to appear as distractors">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {distractors.map((d) => (
              <span
                key={d}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {d}
                <button
                  type="button"
                  onClick={() => removeDistractor(d)}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                >
                  x
                </button>
              </span>
            ))}
            {distractors.length === 0 && (
              <span className="text-sm text-gray-500 italic">
                No distractors selected (will auto-generate)
              </span>
            )}
          </div>
          <LetterSelector
            value=""
            onChange={(letter) => addDistractor(letter)}
            label="Add Distractor"
          />
        </div>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label={`Target ${itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1)} Count`}
          hint={`Number of correct ${itemLabel} to find`}
        >
          <NumberInput
            value={config.targetCount ?? defaultTargetCount}
            onChange={(value) => handleChange('targetCount' as keyof T, value as T[keyof T])}
            min={1}
            max={10}
          />
        </FormField>

        <FormField
          label={`Total ${itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1)}`}
          hint={`Total number of ${itemLabel} to display`}
        >
          <NumberInput
            value={config.totalItems ?? defaultTotalItems}
            onChange={(value) => handleChange('totalItems' as keyof T, value as T[keyof T])}
            min={2}
            max={16}
          />
        </FormField>
      </div>

      {children}
    </div>
  );
}
