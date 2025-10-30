import React from 'react';
import { BaseActivityFormProps } from '../ActivityFormProps';
import { FormField, TextInput, NumberInput } from '../FormField';
import { LetterSelector } from './LetterSelector';

interface TargetLetterWithDistractorsFormProps extends BaseActivityFormProps {
  labels: {
    targetLetterLabel?: string;
    targetLetterHint?: string;
    countBasedDescription: string; // e.g., "Game ends after popping X balloons" or "Game ends after catching X fish"
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
  const distractorLetters = config?.distractorLetters || [];
  const distractorLettersStr = Array.isArray(distractorLetters) ? distractorLetters.join(', ') : '';
  const duration = config?.duration || 60;
  const targetCount = config?.targetCount || 10;

  // Determine which mode is active (default to duration if both are set)
  const endCondition = config?.duration ? 'duration' : 'count';

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  const handleEndConditionChange = (condition: 'duration' | 'count') => {
    if (condition === 'duration') {
      // Set duration, clear targetCount
      updateConfig({ duration: 60, targetCount: undefined });
    } else {
      // Set targetCount, clear duration
      updateConfig({ targetCount: 10, duration: undefined });
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

      <FormField label="Distractor Letters" hint="Wrong letters (comma-separated)" required>
        <TextInput
          value={distractorLettersStr}
          onChange={(value) => {
            const letters = value.split(',').map(l => l.trim()).filter(l => l);
            updateConfig({ distractorLetters: letters });
          }}
          placeholder="ب, ت, ث"
          dir="rtl"
        />
      </FormField>

      <FormField label="Game End Condition" required hint="Choose how the game should end">
        <div className="space-y-3">
          {/* Radio buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleEndConditionChange('duration')}
              className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                endCondition === 'duration'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  endCondition === 'duration' ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {endCondition === 'duration' && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <span className="text-sm font-medium">Time-based</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-6">Game ends after a set duration</p>
            </button>

            <button
              type="button"
              onClick={() => handleEndConditionChange('count')}
              className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                endCondition === 'count'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  endCondition === 'count' ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {endCondition === 'count' && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <span className="text-sm font-medium">Count-based</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-6">{labels.countBasedDescription}</p>
            </button>
          </div>

          {/* Conditional input based on selection */}
          {endCondition === 'duration' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (seconds)
              </label>
              <NumberInput
                value={duration}
                onChange={(value) => updateConfig({ duration: value })}
                min={10}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Count
              </label>
              <NumberInput
                value={targetCount}
                onChange={(value) => updateConfig({ targetCount: value })}
                min={1}
              />
            </div>
          )}
        </div>
      </FormField>
    </div>
  );
}
