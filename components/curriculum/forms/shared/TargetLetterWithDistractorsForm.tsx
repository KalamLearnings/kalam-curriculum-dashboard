import React from 'react';
import { BaseActivityFormProps } from '../ActivityFormProps';
import { FormField, NumberInput } from '../FormField';
import { LetterSelector } from './LetterSelector';
import type { LetterForm } from '../ArabicLetterGrid';

interface TargetLetterWithDistractorsFormProps extends BaseActivityFormProps {
  labels: {
    targetLetterLabel?: string;
    targetLetterHint?: string;
    targetCountLabel?: string;
    targetCountHint?: string;
  };
  targetLetterField?: string; // Field name for target letter (default: 'targetLetter')
}

export function TargetLetterWithDistractorsForm({
  config,
  onChange,
  topic,
  labels,
  targetLetterField = 'targetLetter'
}: TargetLetterWithDistractorsFormProps) {
  const targetLetter = config?.[targetLetterField] || '';
  const targetLetterForm: LetterForm = config?.targetLetterForm || 'isolated';
  const distractorLetters: string[] = config?.distractorLetters || [];
  const targetCount = config?.targetCount ?? '';
  const duration = config?.duration ?? '';

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
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
          onChange={(value, form) => updateConfig({
            [targetLetterField]: value,
            targetLetterForm: form || 'isolated'
          })}
          topic={topic}
          selectedForm={targetLetterForm}
          showFormSelector={true}
        />
      </FormField>

      <FormField label="Distractor Letters" hint="Select the wrong letters" required>
        <LetterSelector
          value={distractorLetters}
          onChange={(value) => updateConfig({ distractorLetters: value })}
          multiSelect
          showFormSelector={true}
          disabledLetters={targetLetter ? [targetLetter] : []}
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
