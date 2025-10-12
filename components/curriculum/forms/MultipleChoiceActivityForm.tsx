import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, NumberInput, Select } from './FormField';

export function MultipleChoiceActivityForm({ config, onChange }: BaseActivityFormProps) {
  const layout = config?.layout || 'vertical';
  const showImages = config?.showImages ?? false;
  const randomizeOptions = config?.randomizeOptions ?? true;
  const maxAttempts = config?.maxAttempts || 3;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <FormField label="Layout" hint="How options are displayed">
        <Select
          value={layout}
          onChange={(value) => updateConfig({ layout: value })}
          options={[
            { value: 'vertical', label: 'Vertical' },
            { value: 'horizontal', label: 'Horizontal' },
            { value: 'grid', label: 'Grid' },
          ]}
        />
      </FormField>

      <FormField label="Show Images" hint="Display images with options">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={showImages}
            onChange={(e) => updateConfig({ showImages: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Enable images for options
          </label>
        </div>
      </FormField>

      <FormField label="Randomize Options" hint="Shuffle option order">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={randomizeOptions}
            onChange={(e) => updateConfig({ randomizeOptions: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Randomize option order
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
