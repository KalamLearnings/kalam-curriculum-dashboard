/**
 * FlyOnFlowersActivityForm - Configuration form for Fly on Flowers activity
 *
 * Students guide a fly (ذُبَابَة) to land on flowers containing the target letter.
 * Teaches the Arabic word for fly.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { TapActivityBaseForm, TapActivityConfig } from './shared/TapActivityBaseForm';
import { FormField, Checkbox } from './FormField';
import { OptionSelector } from './OptionSelector';

interface FlyOnFlowersConfig extends TapActivityConfig {
  flyStyle?: 'cartoon' | 'realistic';
  gardenTheme?: 'spring' | 'summer' | 'tropical';
  flowerTypes?: 'roses' | 'tulips' | 'sunflowers' | 'mixed';
  showArabicLabel?: boolean;
}

export function FlyOnFlowersActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  const typedConfig = (config || {}) as Partial<FlyOnFlowersConfig>;

  const handleSpecificChange = (key: keyof FlyOnFlowersConfig, value: any) => {
    onChange({ ...typedConfig, [key]: value });
  };

  return (
    <TapActivityBaseForm<FlyOnFlowersConfig>
      config={typedConfig}
      onChange={onChange}
      topic={topic}
      itemLabel="flowers"
      defaultTargetCount={4}
      defaultTotalItems={8}
    >
      <FormField label="Fly Style">
        <OptionSelector
          options={[
            { value: 'cartoon', label: 'Cartoon', icon: '🪰', description: 'Friendly cartoon fly' },
            { value: 'realistic', label: 'Realistic', icon: '🦟', description: 'More realistic' },
          ]}
          value={typedConfig.flyStyle || 'cartoon'}
          onChange={(value) => handleSpecificChange('flyStyle', value)}
          columns={2}
        />
      </FormField>

      <FormField label="Flower Types">
        <OptionSelector
          options={[
            { value: 'roses', label: 'Roses', icon: '🌹' },
            { value: 'tulips', label: 'Tulips', icon: '🌷' },
            { value: 'sunflowers', label: 'Sunflowers', icon: '🌻' },
            { value: 'mixed', label: 'Mixed', icon: '💐' },
          ]}
          value={typedConfig.flowerTypes || 'mixed'}
          onChange={(value) => handleSpecificChange('flowerTypes', value)}
        />
      </FormField>

      <FormField label="Garden Theme">
        <OptionSelector
          options={[
            { value: 'spring', label: 'Spring', icon: '🌸' },
            { value: 'summer', label: 'Summer', icon: '☀️' },
            { value: 'tropical', label: 'Tropical', icon: '🌴' },
          ]}
          value={typedConfig.gardenTheme || 'spring'}
          onChange={(value) => handleSpecificChange('gardenTheme', value)}
          columns={3}
        />
      </FormField>

      <Checkbox
        checked={typedConfig.showArabicLabel ?? true}
        onChange={(checked) => handleSpecificChange('showArabicLabel', checked)}
        label="Show Arabic word 'ذُبَابَة' (fly)"
      />
    </TapActivityBaseForm>
  );
}
