import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput } from './FormField';

export function IntroActivityForm({ config, onChange }: BaseActivityFormProps) {
  const letter = config?.letter || '';

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <FormField label="Letter" required hint="The Arabic letter to introduce">
        <TextInput
          value={letter}
          onChange={(value) => updateConfig({ letter: value })}
          required
          dir="rtl"
          placeholder="أ"
        />
      </FormField>
    </div>
  );
}
