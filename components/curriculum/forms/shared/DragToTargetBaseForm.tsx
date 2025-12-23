/**
 * DragToTargetBaseForm - Shared form component for drag-to-target activities
 *
 * Provides common configuration fields for activities where users drag
 * items containing target letters to a target zone.
 */

import React from 'react';
import { FormField, NumberInput } from '../FormField';
import { LetterSelector } from '../../LetterSelector';

export interface DragToTargetConfig {
  targetLetter: string;
  distractorLetters?: string[];
  targetCount?: number;
  totalItems?: number;
}

interface DragToTargetBaseFormProps<T extends DragToTargetConfig> {
  config: Partial<T>;
  onChange: (config: Partial<T>) => void;
  itemLabel?: string; // e.g., "carrots", "bottles", "coins"
  targetLabel?: string; // e.g., "rabbit", "baby", "piggy bank"
  defaultTargetCount?: number;
  defaultTotalItems?: number;
  children?: React.ReactNode; // For activity-specific fields
}

export function DragToTargetBaseForm<T extends DragToTargetConfig>({
  config,
  onChange,
  itemLabel = 'items',
  targetLabel = 'target',
  defaultTargetCount = 4,
  defaultTotalItems = 8,
  children,
}: DragToTargetBaseFormProps<T>) {
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
      <FormField label="Target Letter" hint="The letter on items to drag" required>
        <LetterSelector
          value={config.targetLetter || ''}
          onChange={(letter) => handleChange('targetLetter' as keyof T, letter?.id as T[keyof T])}
        />
      </FormField>

      <FormField label="Distractor Letters" hint="Letters on distractor items">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {distractors.map((d) => (
              <span
                key={d}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
              >
                {d}
                <button
                  type="button"
                  onClick={() => removeDistractor(d)}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-orange-400 hover:bg-orange-200 hover:text-orange-500 focus:outline-none"
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
          label={`Correct ${itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1)}`}
          hint={`Number of ${itemLabel} to drag to ${targetLabel}`}
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
          hint={`Total ${itemLabel} including distractors`}
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
