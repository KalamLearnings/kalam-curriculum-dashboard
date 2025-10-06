import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput, NumberInput } from './FormField';

export function FishingActivityForm({ config, onChange }: BaseActivityFormProps) {
  const targetLetter = config?.targetLetter || '';
  const totalFish = config?.totalFish || 10;
  const correctFishCount = config?.correctFishCount || 5;
  const duration = config?.duration || 30;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <FormField label="Target Letter" required hint="The letter to catch">
        <TextInput
          value={targetLetter}
          onChange={(value) => updateConfig({ targetLetter: value })}
          required
          dir="rtl"
          placeholder="أ"
        />
      </FormField>

      <FormField label="Total Fish" required hint="Total number of fish in the game">
        <NumberInput
          value={totalFish}
          onChange={(value) => updateConfig({ totalFish: value })}
          min={5}
          required
        />
      </FormField>

      <FormField label="Correct Fish Count" required hint="Number of fish with the correct letter">
        <NumberInput
          value={correctFishCount}
          onChange={(value) => updateConfig({ correctFishCount: value })}
          min={1}
          required
        />
      </FormField>

      <FormField label="Duration (seconds)" hint="Time limit for the activity (default: 30)">
        <NumberInput
          value={duration}
          onChange={(value) => updateConfig({ duration: value })}
          min={10}
        />
      </FormField>
    </div>
  );
}
