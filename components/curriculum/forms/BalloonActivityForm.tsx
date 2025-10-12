import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, NumberInput } from './FormField';

export function BalloonActivityForm({ config, onChange }: BaseActivityFormProps) {
  const duration = config?.duration || 60;
  const balloonSpeed = config?.balloonSpeed || 1.0;
  const spawnRate = config?.spawnRate || 1.5;
  const correctRatio = config?.correctRatio || 0.4;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <FormField label="Duration (seconds)" hint="Total game duration (default: 60)">
        <NumberInput
          value={duration}
          onChange={(value) => updateConfig({ duration: value })}
          min={10}
        />
      </FormField>

      <FormField label="Balloon Speed" hint="Speed multiplier (default: 1.0)">
        <NumberInput
          value={balloonSpeed}
          onChange={(value) => updateConfig({ balloonSpeed: value })}
          min={0.5}
          max={3}
          step={0.1}
        />
      </FormField>

      <FormField label="Spawn Rate" hint="Balloons per second (default: 1.5)">
        <NumberInput
          value={spawnRate}
          onChange={(value) => updateConfig({ spawnRate: value })}
          min={0.5}
          max={5}
          step={0.5}
        />
      </FormField>

      <FormField label="Correct Ratio" hint="Percentage of correct balloons (0-1, default: 0.4)">
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
