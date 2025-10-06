import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput, NumberInput } from './FormField';

export function WriteActivityForm({ config, onChange }: BaseActivityFormProps) {
  const letterForm = config?.letterForm || '';
  const traceCount = config?.traceCount || 1;
  const maxAttempts = config?.maxAttempts || 5;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <FormField label="Letter Form" required hint="The Arabic letter form to trace">
        <TextInput
          value={letterForm}
          onChange={(value) => updateConfig({ letterForm: value })}
          required
          dir="rtl"
          placeholder="أ"
        />
      </FormField>

      <FormField label="Trace Count" hint="Number of times to trace (default: 1)">
        <NumberInput
          value={traceCount}
          onChange={(value) => updateConfig({ traceCount: value })}
          min={1}
        />
      </FormField>

      <FormField label="Max Attempts" hint="Maximum number of attempts allowed (default: 5)">
        <NumberInput
          value={maxAttempts}
          onChange={(value) => updateConfig({ maxAttempts: value })}
          min={1}
        />
      </FormField>
    </div>
  );
}
