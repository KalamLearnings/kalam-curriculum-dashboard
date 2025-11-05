import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField } from './FormField';

export function ActivityRequestForm({ config, onChange }: BaseActivityFormProps) {
  const description = config?.description || '';
  const notes = config?.notes || '';

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>About Activity Requests:</strong> Use this placeholder to describe an activity you want built but isn't available yet. This helps capture requirements and ideas for future implementation.
        </p>
      </div>

      <FormField
        label="Activity Description"
        hint="Describe what the activity should do (minimum 10 characters)"
        required
      >
        <textarea
          value={description}
          onChange={(e) => updateConfig({ description: e.target.value })}
          placeholder="Example: Students match letter sounds with pictures of objects that start with that letter..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[120px]"
          rows={6}
        />
        <p className="text-xs text-gray-500 mt-1">
          {description.length < 10 && (
            <span className="text-orange-600">
              {10 - description.length} more character{10 - description.length !== 1 ? 's' : ''} required
            </span>
          )}
          {description.length >= 10 && (
            <span className="text-green-600">✓ Description meets minimum length</span>
          )}
        </p>
      </FormField>

      <FormField
        label="Implementation Notes"
        hint="Additional details, requirements, or technical notes (optional)"
      >
        <textarea
          value={notes}
          onChange={(e) => updateConfig({ notes: e.target.value })}
          placeholder="Example: Should have audio playback for each letter sound. Consider using drag-and-drop for matching..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[100px]"
          rows={4}
        />
      </FormField>

      {description.length < 10 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Please provide a description of at least 10 characters
          </p>
        </div>
      )}

      {description.length >= 10 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Activity Request Ready:</strong> This placeholder will be saved with your curriculum. Developers can review it when implementing new activities.
          </p>
        </div>
      )}
    </div>
  );
}
