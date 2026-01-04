/**
 * DragToTargetBaseForm - Shared form component for drag-to-target activities
 *
 * Provides common configuration fields for activities where users drag
 * items containing target letters to a target zone.
 */

import React from 'react';
import { FormField, NumberInput, TextInput } from '../FormField';
import { LetterSelector } from './LetterSelector';
import type { Topic } from '@/lib/schemas/curriculum';

export interface DragToTargetConfig {
  targetLetter: string;
  distractorLetters?: string[];
  targetCount?: number;
  totalItems?: number;
}

interface DragToTargetBaseFormProps<T extends DragToTargetConfig> {
  config: Partial<T>;
  onChange: (config: Partial<T>) => void;
  topic?: Topic | null;
  itemLabel?: string; // e.g., "carrots", "bottles", "coins"
  targetLabel?: string; // e.g., "rabbit", "baby", "piggy bank"
  defaultTargetCount?: number;
  defaultTotalItems?: number;
  children?: React.ReactNode; // For activity-specific fields
}

export function DragToTargetBaseForm<T extends DragToTargetConfig>({
  config,
  onChange,
  topic,
  itemLabel = 'items',
  targetLabel = 'target',
  defaultTargetCount = 4,
  defaultTotalItems = 8,
  children,
}: DragToTargetBaseFormProps<T>) {
  const distractors = config.distractorLetters || [];
  const distractorLettersStr = Array.isArray(distractors) ? distractors.join(', ') : '';

  const handleChange = <K extends keyof T>(key: K, value: T[K]) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-6">
      <FormField label="Target Letter" hint="The letter on items to drag" required>
        <LetterSelector
          value={config.targetLetter || ''}
          onChange={(value) => handleChange('targetLetter' as keyof T, value as T[keyof T])}
          topic={topic}
        />
      </FormField>

      <FormField label="Distractor Letters" hint="Wrong letters (comma-separated)">
        <TextInput
          value={distractorLettersStr}
          onChange={(value) => {
            const letters = value.split(',').map(l => l.trim()).filter(l => l);
            handleChange('distractorLetters' as keyof T, letters as T[keyof T]);
          }}
          placeholder="ب, ت, ث"
          dir="rtl"
        />
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
