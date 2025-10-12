import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, NumberInput } from './FormField';

export function NameBuilderActivityForm({ config, onChange }: BaseActivityFormProps) {
  const letterBankSize = config?.letterBankSize || 8;
  const showHints = config?.showHints ?? true;
  const scrambleLetters = config?.scrambleLetters ?? true;
  const maxAttempts = config?.maxAttempts || 5;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <FormField label="Letter Bank Size" hint="Number of letters in the pool (default: 8)">
        <NumberInput
          value={letterBankSize}
          onChange={(value) => updateConfig({ letterBankSize: value })}
          min={4}
          max={15}
        />
      </FormField>

      <FormField label="Show Hints" hint="Display visual hints for correct placement">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={showHints}
            onChange={(e) => updateConfig({ showHints: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Enable hint display
          </label>
        </div>
      </FormField>

      <FormField label="Scramble Letters" hint="Randomize letter order">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={scrambleLetters}
            onChange={(e) => updateConfig({ scrambleLetters: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Randomize letter positions
          </label>
        </div>
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
