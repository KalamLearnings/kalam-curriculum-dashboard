import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, Select } from './FormField';

export function PresentationActivityForm({ config, onChange }: BaseActivityFormProps) {
  const slideTransition = config?.slideTransition || 'fade';
  const showExamples = config?.showExamples ?? true;
  const autoAdvance = config?.autoAdvance ?? false;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <FormField label="Slide Transition" hint="How slides transition">
        <Select
          value={slideTransition}
          onChange={(value) => updateConfig({ slideTransition: value })}
          options={[
            { value: 'fade', label: 'Fade' },
            { value: 'slide', label: 'Slide' },
            { value: 'zoom', label: 'Zoom' },
          ]}
        />
      </FormField>

      <FormField label="Show Examples" hint="Display example words/usage">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={showExamples}
            onChange={(e) => updateConfig({ showExamples: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Enable example display
          </label>
        </div>
      </FormField>

      <FormField label="Auto Advance" hint="Automatically move to next slide">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={autoAdvance}
            onChange={(e) => updateConfig({ autoAdvance: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Auto-advance slides
          </label>
        </div>
      </FormField>
    </div>
  );
}
