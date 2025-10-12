import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput } from './FormField';

export function TapActivityForm({ config, onChange }: BaseActivityFormProps) {
  const showHighlight = config?.showHighlight ?? false;
  const highlightColor = config?.highlightColor || '#FFD700';
  const provideFeedback = config?.provideFeedback ?? true;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <FormField label="Show Highlight" hint="Show visual highlight on correct tap">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={showHighlight}
            onChange={(e) => updateConfig({ showHighlight: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Enable highlight effect
          </label>
        </div>
      </FormField>

      <FormField label="Highlight Color" hint="Color for the highlight effect">
        <TextInput
          value={highlightColor}
          onChange={(value) => updateConfig({ highlightColor: value })}
          placeholder="#FFD700"
        />
      </FormField>

      <FormField label="Provide Feedback" hint="Give feedback on incorrect taps">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={provideFeedback}
            onChange={(e) => updateConfig({ provideFeedback: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Enable feedback on wrong taps
          </label>
        </div>
      </FormField>
    </div>
  );
}
