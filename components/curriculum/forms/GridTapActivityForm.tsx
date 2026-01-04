/**
 * GridTapActivityForm - Configuration form for Grid Tap activity
 *
 * Grid-based letter selection where students tap cells containing the target letter.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { TapActivityBaseForm, TapActivityConfig } from './shared/TapActivityBaseForm';
import { FormField, NumberInput } from './FormField';
import { OptionSelector } from './OptionSelector';

interface GridTapConfig extends TapActivityConfig {
  gridCols?: number;
  gridRows?: number;
  theme?: 'default' | 'garden' | 'ocean' | 'space';
}

export function GridTapActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  const typedConfig = (config || {}) as Partial<GridTapConfig>;

  const handleSpecificChange = (key: keyof GridTapConfig, value: any) => {
    onChange({ ...typedConfig, [key]: value });
  };

  return (
    <TapActivityBaseForm<GridTapConfig>
      config={typedConfig}
      onChange={onChange}
      topic={topic}
      itemLabel="cells"
      defaultTargetCount={4}
      defaultTotalItems={12}
    >
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Grid Columns" hint="Number of columns in grid">
          <NumberInput
            value={typedConfig.gridCols ?? 4}
            onChange={(value) => handleSpecificChange('gridCols', value)}
            min={2}
            max={6}
          />
        </FormField>

        <FormField label="Grid Rows" hint="Number of rows in grid">
          <NumberInput
            value={typedConfig.gridRows ?? 3}
            onChange={(value) => handleSpecificChange('gridRows', value)}
            min={2}
            max={5}
          />
        </FormField>
      </div>

      <FormField label="Theme">
        <OptionSelector
          options={[
            { value: 'default', label: 'Default', icon: '🔲' },
            { value: 'garden', label: 'Garden', icon: '🌻' },
            { value: 'ocean', label: 'Ocean', icon: '🌊' },
            { value: 'space', label: 'Space', icon: '🚀' },
          ]}
          value={typedConfig.theme || 'default'}
          onChange={(value) => handleSpecificChange('theme', value)}
        />
      </FormField>
    </TapActivityBaseForm>
  );
}
