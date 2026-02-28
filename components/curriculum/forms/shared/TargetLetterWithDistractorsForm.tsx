import React from 'react';
import { BaseActivityFormProps } from '../ActivityFormProps';
import { FormField, NumberInput } from '../FormField';
import { LetterSelector } from './LetterSelector';
import { cn } from '@/lib/utils';
import type { LetterReference } from '../ArabicLetterGrid';
import type { LetterPosition } from '@/lib/types/activity-configs';

const LETTER_POSITIONS: { value: LetterPosition; label: string }[] = [
  { value: 'isolated', label: 'Isolated' },
  { value: 'initial', label: 'Initial' },
  { value: 'medial', label: 'Medial' },
  { value: 'final', label: 'Final' },
];

interface TargetLetterWithDistractorsFormProps extends BaseActivityFormProps {
  labels: {
    targetLetterLabel?: string;
    targetLetterHint?: string;
    targetCountLabel?: string;
    targetCountHint?: string;
  };
  /** Field name for target letter in config (default: 'targetLetter') */
  targetLetterField?: string;
  /** Whether to show letter positions selector (for themed activities) */
  showLetterPositions?: boolean;
}

export function TargetLetterWithDistractorsForm({
  config,
  onChange,
  topic,
  labels,
  targetLetterField = 'targetLetter',
  showLetterPositions = true,
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
  const letterPositions: LetterPosition[] = typedConfig?.letterPositions || ['isolated'];

  const updateConfig = (updates: Record<string, any>) => {
    onChange({ ...config, ...updates } as any);
  };

  const toggleLetterPosition = (position: LetterPosition) => {
    const newPositions = letterPositions.includes(position)
      ? letterPositions.filter(p => p !== position)
      : [...letterPositions, position];
    // Ensure at least one position is selected
    if (newPositions.length > 0) {
      updateConfig({ letterPositions: newPositions });
    }
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
        />
      </FormField>

      {showLetterPositions && (
        <FormField
          label="Letter Positions"
          hint="Select which letter forms to include in the activity"
        >
          <div className="grid grid-cols-4 gap-2">
            {LETTER_POSITIONS.map((pos) => (
              <button
                key={pos.value}
                type="button"
                onClick={() => toggleLetterPosition(pos.value)}
                className={cn(
                  'px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                  letterPositions.includes(pos.value)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-gray-50'
                )}
              >
                {pos.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {letterPositions.length === 1 && `Only ${letterPositions[0]} form will be shown`}
            {letterPositions.length > 1 && `${letterPositions.length} letter forms will appear randomly`}
          </p>
        </FormField>
      )}

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
