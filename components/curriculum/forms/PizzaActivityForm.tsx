import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, NumberInput, Select } from './FormField';

export function PizzaActivityForm({ config, onChange }: BaseActivityFormProps) {
  const toppingCount = config?.toppingCount || 4;
  const displayLayout = config?.displayLayout || 'circular';
  const showHints = config?.showHints ?? true;
  const maxAttempts = config?.maxAttempts || 3;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <FormField label="Topping Count" hint="Number of topping options to display (default: 4)">
        <NumberInput
          value={toppingCount}
          onChange={(value) => updateConfig({ toppingCount: value })}
          min={2}
          max={8}
        />
      </FormField>

      <FormField label="Display Layout" hint="How toppings are arranged">
        <Select
          value={displayLayout}
          onChange={(value) => updateConfig({ displayLayout: value })}
          options={[
            { value: 'circular', label: 'Circular' },
            { value: 'grid', label: 'Grid' },
            { value: 'horizontal', label: 'Horizontal' },
          ]}
        />
      </FormField>

      <FormField label="Show Hints" hint="Display visual hints for correct answers">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={showHints}
            onChange={(e) => updateConfig({ showHints: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Enable hint animations
          </label>
        </div>
      </FormField>

      <FormField label="Max Attempts" hint="Maximum number of attempts allowed (default: 3)">
        <NumberInput
          value={maxAttempts}
          onChange={(value) => updateConfig({ maxAttempts: value })}
          min={1}
        />
      </FormField>
    </div>
  );
}
