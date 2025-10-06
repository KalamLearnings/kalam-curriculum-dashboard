import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, Select, NumberInput } from './FormField';

export function BreakActivityForm({ config, onChange }: BaseActivityFormProps) {
  const variant = config?.variant || 'tracing_lines';
  const duration = config?.duration || 30;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <FormField label="Break Type" required hint="Type of break activity">
        <Select
          value={variant}
          onChange={(value) => updateConfig({ variant: value })}
          options={[
            { value: 'tracing_lines', label: 'Tracing Lines' },
            { value: 'dot_tapping', label: 'Dot Tapping' },
            { value: 'coloring', label: 'Coloring' },
            { value: 'memory_game', label: 'Memory Game' },
          ]}
        />
      </FormField>

      <FormField label="Duration (seconds)" hint="How long the break activity should last">
        <NumberInput
          value={duration}
          onChange={(value) => updateConfig({ duration: value })}
          min={10}
        />
      </FormField>
    </div>
  );
}
