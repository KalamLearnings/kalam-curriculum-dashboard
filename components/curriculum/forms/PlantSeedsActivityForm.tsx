/**
 * PlantSeedsActivityForm - Configuration form for Plant Seeds activity
 *
 * Students tap on seeds with the target letter to plant them.
 * Teaches the Arabic word زَرَعَ (to plant).
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { TapActivityBaseForm, TapActivityConfig } from './shared/TapActivityBaseForm';
import { FormField, Checkbox } from './FormField';
import { OptionSelector } from './OptionSelector';

interface PlantSeedsConfig extends TapActivityConfig {
  plantType?: 'flowers' | 'vegetables' | 'trees' | 'mixed';
  gardenTheme?: 'spring' | 'summer' | 'greenhouse';
  showGrowthAnimation?: boolean;
  showArabicLabel?: boolean;
}

export function PlantSeedsActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  const typedConfig = (config || {}) as Partial<PlantSeedsConfig>;

  const handleSpecificChange = (key: keyof PlantSeedsConfig, value: any) => {
    onChange({ ...typedConfig, [key]: value });
  };

  return (
    <TapActivityBaseForm<PlantSeedsConfig>
      config={typedConfig}
      onChange={onChange}
      topic={topic}
      itemLabel="seeds"
      defaultTargetCount={4}
      defaultTotalItems={8}
    >
      <FormField label="Plant Type" hint="What grows from the seeds">
        <OptionSelector
          options={[
            { value: 'flowers', label: 'Flowers', icon: '🌸' },
            { value: 'vegetables', label: 'Vegetables', icon: '🥕' },
            { value: 'trees', label: 'Trees', icon: '🌳' },
            { value: 'mixed', label: 'Mixed', icon: '🌱' },
          ]}
          value={typedConfig.plantType || 'flowers'}
          onChange={(value) => handleSpecificChange('plantType', value)}
        />
      </FormField>

      <FormField label="Garden Theme">
        <OptionSelector
          options={[
            { value: 'spring', label: 'Spring Garden', icon: '🌷', description: 'Outdoor garden' },
            { value: 'summer', label: 'Summer Garden', icon: '☀️', description: 'Sunny day' },
            { value: 'greenhouse', label: 'Greenhouse', icon: '🏠', description: 'Indoor plants' },
          ]}
          value={typedConfig.gardenTheme || 'spring'}
          onChange={(value) => handleSpecificChange('gardenTheme', value)}
          columns={3}
        />
      </FormField>

      <div className="space-y-3">
        <Checkbox
          checked={typedConfig.showGrowthAnimation ?? true}
          onChange={(checked) => handleSpecificChange('showGrowthAnimation', checked)}
          label="Show plant growth animation when seed is planted"
        />

        <Checkbox
          checked={typedConfig.showArabicLabel ?? true}
          onChange={(checked) => handleSpecificChange('showArabicLabel', checked)}
          label="Show Arabic word 'زَرَعَ' (to plant)"
        />
      </div>
    </TapActivityBaseForm>
  );
}
