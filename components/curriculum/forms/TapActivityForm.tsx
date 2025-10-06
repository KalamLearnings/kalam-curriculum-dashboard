import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput, NumberInput } from './FormField';

export function TapActivityForm({ config, onChange }: BaseActivityFormProps) {
  const targetWord = config?.targetWord || '';
  const targetLetter = config?.targetLetter || '';
  const targetCount = config?.targetCount || 1;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <FormField label="Target Word" required hint="The Arabic word containing letters to tap">
        <TextInput
          value={targetWord}
          onChange={(value) => updateConfig({ targetWord: value })}
          required
          dir="rtl"
          placeholder="كتاب"
        />
      </FormField>

      <FormField label="Target Letter" required hint="The letter students should tap">
        <TextInput
          value={targetLetter}
          onChange={(value) => updateConfig({ targetLetter: value })}
          required
          dir="rtl"
          placeholder="ك"
        />
      </FormField>

      <FormField label="Target Count" required hint="How many times to tap the letter">
        <NumberInput
          value={targetCount}
          onChange={(value) => updateConfig({ targetCount: value })}
          min={1}
          required
        />
      </FormField>
    </div>
  );
}
