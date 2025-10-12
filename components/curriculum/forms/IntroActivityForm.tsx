import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, Select } from './FormField';

export function IntroActivityForm({ config, onChange }: BaseActivityFormProps) {
  const animationStyle = config?.animationStyle || 'fade';
  const showPhonetics = config?.showPhonetics ?? true;
  const autoPlay = config?.autoPlay ?? true;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <FormField label="Animation Style" hint="How content is revealed">
        <Select
          value={animationStyle}
          onChange={(value) => updateConfig({ animationStyle: value })}
          options={[
            { value: 'fade', label: 'Fade' },
            { value: 'slide', label: 'Slide' },
            { value: 'zoom', label: 'Zoom' },
          ]}
        />
      </FormField>

      <FormField label="Show Phonetics" hint="Display phonetic pronunciation">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={showPhonetics}
            onChange={(e) => updateConfig({ showPhonetics: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Enable phonetic display
          </label>
        </div>
      </FormField>

      <FormField label="Auto Play" hint="Automatically play audio on introduction">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={(e) => updateConfig({ autoPlay: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Auto-play audio
          </label>
        </div>
      </FormField>
    </div>
  );
}
