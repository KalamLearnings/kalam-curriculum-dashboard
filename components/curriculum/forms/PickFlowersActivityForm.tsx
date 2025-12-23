/**
 * PickFlowersActivityForm - Configuration form for Pick Flowers activity
 *
 * Students tap on flowers in a garden that contain the target letter.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { TapActivityBaseForm, TapActivityConfig } from './shared/TapActivityBaseForm';
import { FormField } from './FormField';
import { OptionSelector } from './OptionSelector';

interface PickFlowersConfig extends TapActivityConfig {
  flowerStyle?: 'tulips' | 'roses' | 'sunflowers' | 'mixed';
  gardenTheme?: 'spring' | 'summer' | 'rainbow';
}

export function PickFlowersActivityForm({ config, onChange }: BaseActivityFormProps) {
  const typedConfig = (config || {}) as Partial<PickFlowersConfig>;

  const handleSpecificChange = (key: keyof PickFlowersConfig, value: any) => {
    onChange({ ...typedConfig, [key]: value });
  };

  return (
    <TapActivityBaseForm<PickFlowersConfig>
      config={typedConfig}
      onChange={onChange}
      itemLabel="flowers"
      defaultTargetCount={4}
      defaultTotalItems={8}
    >
      <FormField label="Flower Style" hint="Type of flowers to display">
        <OptionSelector
          options={[
            { value: 'tulips', label: 'Tulips', icon: '🌷' },
            { value: 'roses', label: 'Roses', icon: '🌹' },
            { value: 'sunflowers', label: 'Sunflowers', icon: '🌻' },
            { value: 'mixed', label: 'Mixed', icon: '💐' },
          ]}
          value={typedConfig.flowerStyle || 'mixed'}
          onChange={(value) => handleSpecificChange('flowerStyle', value)}
        />
      </FormField>

      <FormField label="Garden Theme">
        <OptionSelector
          options={[
            { value: 'spring', label: 'Spring', icon: '🌸', description: 'Pastel colors' },
            { value: 'summer', label: 'Summer', icon: '☀️', description: 'Bright colors' },
            { value: 'rainbow', label: 'Rainbow', icon: '🌈', description: 'Colorful mix' },
          ]}
          value={typedConfig.gardenTheme || 'spring'}
          onChange={(value) => handleSpecificChange('gardenTheme', value)}
          columns={3}
        />
      </FormField>
    </TapActivityBaseForm>
  );
}
