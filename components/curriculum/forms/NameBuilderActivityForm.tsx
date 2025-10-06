import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput } from './FormField';

export function NameBuilderActivityForm({ config, onChange }: BaseActivityFormProps) {
  const targetName = config?.targetName || '';

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <FormField label="Target Name/Word" required hint="The Arabic name or word to build">
        <TextInput
          value={targetName}
          onChange={(value) => updateConfig({ targetName: value })}
          required
          dir="rtl"
          placeholder="محمد"
        />
      </FormField>
    </div>
  );
}
