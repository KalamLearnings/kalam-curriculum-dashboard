import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput, NumberInput } from './FormField';

export function BalloonActivityForm({ config, onChange }: BaseActivityFormProps) {
  const correctLetter = config?.correctLetter || '';
  const distractorLetters = config?.distractorLetters?.join(', ') || '';
  const targetCount = config?.targetCount || 5;
  const duration = config?.duration || 30;
  const minSpeed = config?.minSpeed || 1;
  const maxSpeed = config?.maxSpeed || 3;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  const handleDistractorLettersChange = (value: string) => {
    const letters = value.split(',').map(l => l.trim()).filter(l => l);
    updateConfig({ distractorLetters: letters });
  };

  return (
    <div className="space-y-4">
      <FormField label="Correct Letter" required hint="The letter to pop">
        <TextInput
          value={correctLetter}
          onChange={(value) => updateConfig({ correctLetter: value })}
          required
          dir="rtl"
          placeholder="أ"
        />
      </FormField>

      <FormField label="Distractor Letters" required hint="Comma-separated letters to avoid">
        <TextInput
          value={distractorLetters}
          onChange={handleDistractorLettersChange}
          required
          dir="rtl"
          placeholder="ب, ت, ث"
        />
      </FormField>

      <FormField label="Target Count" required hint="How many correct balloons to pop">
        <NumberInput
          value={targetCount}
          onChange={(value) => updateConfig({ targetCount: value })}
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

      <FormField label="Min Speed" hint="Minimum balloon speed (default: 1)">
        <NumberInput
          value={minSpeed}
          onChange={(value) => updateConfig({ minSpeed: value })}
          min={0.5}
          step={0.5}
        />
      </FormField>

      <FormField label="Max Speed" hint="Maximum balloon speed (default: 3)">
        <NumberInput
          value={maxSpeed}
          onChange={(value) => updateConfig({ maxSpeed: value })}
          min={0.5}
          step={0.5}
        />
      </FormField>
    </div>
  );
}
