import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput } from './FormField';

export function NameBuilderActivityForm({ config, onChange }: BaseActivityFormProps) {
  const targetWord = config?.targetWord || '';
  const showConnectedForm = config?.showConnectedForm ?? true;
  const highlightCorrectPositions = config?.highlightCorrectPositions ?? true;
  const scrambleLetters = config?.scrambleLetters ?? true;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">

      <FormField label="Target Word" hint="The word to build (Arabic)" required>
        <TextInput
          value={targetWord}
          onChange={(value) => updateConfig({ targetWord: value })}
          placeholder="كلمة"
          dir="rtl"
        />
      </FormField>

      <FormField label="Show Connected Form" hint="Display how letters connect">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={showConnectedForm}
            onChange={(e) => updateConfig({ showConnectedForm: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Show connected form
          </label>
        </div>
      </FormField>

      <FormField label="Highlight Correct Positions" hint="Highlight correct drop zones">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={highlightCorrectPositions}
            onChange={(e) => updateConfig({ highlightCorrectPositions: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Enable position highlighting
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
    </div>
  );
}
