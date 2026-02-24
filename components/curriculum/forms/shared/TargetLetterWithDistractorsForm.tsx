import React from 'react';
import { BaseActivityFormProps } from '../ActivityFormProps';
import { FormField, NumberInput } from '../FormField';
import { LetterSelector } from './LetterSelector';
import type { LetterReference } from '../ArabicLetterGrid';

interface TargetLetterWithDistractorsFormProps extends BaseActivityFormProps {
  labels: {
    targetLetterLabel?: string;
    targetLetterHint?: string;
    targetCountLabel?: string;
    targetCountHint?: string;
  };
  /** Field name for target letter in config (default: 'targetLetter') */
  targetLetterField?: string;
}

export function TargetLetterWithDistractorsForm({
  config,
  onChange,
  topic,
  labels,
  targetLetterField = 'targetLetter'
}: TargetLetterWithDistractorsFormProps) {
  // Note: config type from @kalam/curriculum-schemas still expects old format
  // We're migrating to LetterReference format
  const typedConfig = config as any;
  // Target letter is now a LetterReference object
  const targetLetter: LetterReference | null = typedConfig?.[targetLetterField] || null;
  // Distractor letters is now an array of LetterReference objects
  const distractorLetters: LetterReference[] = typedConfig?.distractorLetters || [];
  const targetCount = typedConfig?.targetCount ?? '';
  const duration = typedConfig?.duration ?? '';

  const updateConfig = (updates: Record<string, any>) => {
    onChange({ ...config, ...updates } as any);
  };

  return (
    <div className="space-y-4">
      <FormField
        label={labels.targetLetterLabel || "Target Letter"}
        hint={labels.targetLetterHint || "Select the target letter and form"}
        required
      >
        <LetterSelector
          value={targetLetter}
          onChange={(value) => updateConfig({ [targetLetterField]: value })}
          topic={topic}
          showFormSelector={true}
        />
      </FormField>

      <FormField label="Distractor Letters" hint="Select letters and their forms" required>
        <LetterSelector
          value={distractorLetters}
          onChange={(value) => updateConfig({ distractorLetters: value })}
          multiSelect
          multiFormSelect
          disabledLetterIds={targetLetter ? [targetLetter.letterId] : []}
          disabledTooltip="This is the target letter"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label={labels.targetCountLabel || "Target Count"}
          hint={labels.targetCountHint || "Number of correct responses to complete (optional)"}
        >
          <NumberInput
            value={targetCount}
            onChange={(value) => updateConfig({ targetCount: value || undefined })}
            min={1}
            placeholder="e.g., 5"
          />
        </FormField>

        <FormField
          label="Duration (seconds)"
          hint="Time limit for the activity (optional)"
        >
          <NumberInput
            value={duration}
            onChange={(value) => updateConfig({ duration: value || undefined })}
            min={10}
            placeholder="e.g., 60"
          />
        </FormField>
      </div>
    </div>
  );
}
