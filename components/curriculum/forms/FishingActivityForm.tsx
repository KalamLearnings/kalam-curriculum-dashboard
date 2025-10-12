import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, NumberInput } from './FormField';

export function FishingActivityForm({ config, onChange }: BaseActivityFormProps) {
  const duration = config?.duration || 30;
  const fishSpeed = config?.fishSpeed || 1.0;
  const spawnInterval = config?.spawnInterval || 2.0;
  const correctRatio = config?.correctRatio || 0.5;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <FormField label="Duration (seconds)" hint="Time limit for the activity (default: 30)">
        <NumberInput
          value={duration}
          onChange={(value) => updateConfig({ duration: value })}
          min={10}
        />
      </FormField>

      <FormField label="Fish Speed" hint="Speed multiplier for fish movement (default: 1.0)">
        <NumberInput
          value={fishSpeed}
          onChange={(value) => updateConfig({ fishSpeed: value })}
          min={0.5}
          max={3}
          step={0.1}
        />
      </FormField>

      <FormField label="Spawn Interval" hint="Seconds between fish spawns (default: 2.0)">
        <NumberInput
          value={spawnInterval}
          onChange={(value) => updateConfig({ spawnInterval: value })}
          min={0.5}
          max={5}
          step={0.5}
        />
      </FormField>

      <FormField label="Correct Ratio" hint="Percentage of correct fish (0-1, default: 0.5)">
        <NumberInput
          value={correctRatio}
          onChange={(value) => updateConfig({ correctRatio: value })}
          min={0.1}
          max={0.9}
          step={0.1}
        />
      </FormField>
    </div>
  );
}
