import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, NumberInput } from './FormField';

export function WriteActivityForm({ config, onChange }: BaseActivityFormProps) {
  const mode = config?.mode || 'guided';
  const recognitionTolerance = config?.recognitionTolerance ?? 0.8;
  const showStrokeOrder = config?.showStrokeOrder ?? true;
  const showStrokeDirection = config?.showStrokeDirection ?? true;
  const traceCount = config?.traceCount || 3;
  const maxAttempts = config?.maxAttempts || 5;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <FormField label="Writing Mode" hint="How students write the letter">
        <select
          value={mode}
          onChange={(e) => updateConfig({ mode: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="guided">Guided (with guide path)</option>
          <option value="freehand">Freehand (no guide)</option>
        </select>
      </FormField>

      <FormField label="Recognition Tolerance" hint="How strict recognition is (0-1, default: 0.8)">
        <NumberInput
          value={recognitionTolerance}
          onChange={(value) => updateConfig({ recognitionTolerance: value })}
          min={0}
          max={1}
          step={0.1}
        />
      </FormField>

      <FormField label="Show Stroke Order" hint="Display stroke order numbers">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={showStrokeOrder}
            onChange={(e) => updateConfig({ showStrokeOrder: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Show stroke order numbers
          </label>
        </div>
      </FormField>

      <FormField label="Show Stroke Direction" hint="Display stroke direction arrows">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={showStrokeDirection}
            onChange={(e) => updateConfig({ showStrokeDirection: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Show stroke direction arrows
          </label>
        </div>
      </FormField>

      <FormField label="Trace Count" hint="Number of times to trace (default: 3)">
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
