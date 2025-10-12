import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, NumberInput, Select } from './FormField';

export function DragDropActivityForm({ config, onChange }: BaseActivityFormProps) {
  const variant = config?.variant || 'animal_mouth';
  const maxAttempts = config?.maxAttempts || 3;
  const showFeedback = config?.showFeedback ?? true;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <FormField label="Variant" hint="Type of drag and drop activity">
        <Select
          value={variant}
          onChange={(value) => updateConfig({ variant: value })}
          options={[
            { value: 'animal_mouth', label: 'Animal Mouth' },
            { value: 'word_slots', label: 'Word Slots' },
            { value: 'letter_matching', label: 'Letter Matching' },
          ]}
        />
      </FormField>

      <FormField label="Max Attempts" hint="Maximum number of attempts allowed (default: 3)">
        <NumberInput
          value={maxAttempts}
          onChange={(value) => updateConfig({ maxAttempts: value })}
          min={1}
        />
      </FormField>

      <FormField label="Show Feedback" hint="Display feedback on incorrect attempts">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={showFeedback}
            onChange={(e) => updateConfig({ showFeedback: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Enable feedback messages
          </label>
        </div>
      </FormField>
    </div>
  );
}
