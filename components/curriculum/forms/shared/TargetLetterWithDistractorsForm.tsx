import React from 'react';
import { BaseActivityFormProps } from '../ActivityFormProps';
import { FormField, NumberInput } from '../FormField';
import { LetterSelector } from './LetterSelector';
import { useLetters } from '@/lib/hooks/useLetters';

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
  const { letters, loading: lettersLoading } = useLetters();
  const targetLetter = config?.[targetLetterField] || '';
  const distractorLetters: string[] = config?.distractorLetters || [];
  const targetCount = config?.targetCount ?? '';
  const duration = config?.duration ?? '';

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  const toggleDistractorLetter = (letter: string) => {
    const current = distractorLetters;
    if (current.includes(letter)) {
      updateConfig({ distractorLetters: current.filter(l => l !== letter) });
    } else {
      updateConfig({ distractorLetters: [...current, letter] });
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        label={labels.targetLetterLabel || "Target Letter"}
        hint={labels.targetLetterHint || "The target letter to find"}
        required
      >
        <LetterSelector
          value={targetLetter}
          onChange={(value) => updateConfig({ [targetLetterField]: value })}
          topic={topic}
          label={labels.targetLetterLabel}
          hint={labels.targetLetterHint}
        />
      </FormField>

      <FormField label="Distractor Letters" hint="Select the wrong letters (click to toggle)" required>
        {lettersLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading letters...</div>
          </div>
        ) : (
          <div>
            {/* Letter keyboard grid */}
            <div className="grid grid-cols-7 gap-2">
              {letters.map((letter) => {
                const isSelected = distractorLetters.includes(letter.letter);
                const isTargetLetter = letter.letter === targetLetter;

                return (
                  <button
                    key={letter.id}
                    type="button"
                    onClick={() => !isTargetLetter && toggleDistractorLetter(letter.letter)}
                    disabled={isTargetLetter}
                    className={`
                      aspect-square rounded-lg border-2 transition-all
                      flex flex-col items-center justify-center
                      ${isTargetLetter
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isSelected
                          ? 'border-blue-600 bg-blue-100 ring-2 ring-blue-600 ring-offset-1'
                          : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                      }
                    `}
                    title={isTargetLetter ? 'This is the target letter' : letter.name_english}
                  >
                    <div className="text-2xl font-arabic mb-0.5">{letter.letter}</div>
                    <div className="text-xs text-gray-600 truncate px-1">{letter.name_english}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
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
