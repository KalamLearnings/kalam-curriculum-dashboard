/**
 * FeedBabyActivityForm - Configuration form for Feed Baby activity
 *
 * Students drag baby bottles (رَضَّاعَة) with the target letter to feed a baby.
 * Teaches the Arabic word for baby bottle.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { DragToTargetBaseForm, DragToTargetConfig } from './shared/DragToTargetBaseForm';
import { FormField, Checkbox } from './FormField';
import { OptionSelector } from './OptionSelector';

interface FeedBabyConfig extends DragToTargetConfig {
  bottleColor?: 'pink' | 'blue' | 'yellow' | 'mixed';
  showArabicLabel?: boolean;
  nurseryTheme?: 'pastel' | 'bright';
}

export function FeedBabyActivityForm({ config, onChange }: BaseActivityFormProps) {
  const typedConfig = (config || {}) as Partial<FeedBabyConfig>;

  const handleSpecificChange = (key: keyof FeedBabyConfig, value: any) => {
    onChange({ ...typedConfig, [key]: value });
  };

  return (
    <DragToTargetBaseForm<FeedBabyConfig>
      config={typedConfig}
      onChange={onChange}
      itemLabel="bottles"
      targetLabel="the baby"
      defaultTargetCount={3}
      defaultTotalItems={6}
    >
      <FormField label="Bottle Colors">
        <OptionSelector
          options={[
            { value: 'pink', label: 'Pink', icon: '🍼' },
            { value: 'blue', label: 'Blue', icon: '🍼' },
            { value: 'yellow', label: 'Yellow', icon: '🍼' },
            { value: 'mixed', label: 'Mixed', icon: '🌈' },
          ]}
          value={typedConfig.bottleColor || 'mixed'}
          onChange={(value) => handleSpecificChange('bottleColor', value)}
        />
      </FormField>

      <FormField label="Nursery Theme">
        <OptionSelector
          options={[
            { value: 'pastel', label: 'Pastel', icon: '🎀', description: 'Soft colors' },
            { value: 'bright', label: 'Bright', icon: '⭐', description: 'Vibrant colors' },
          ]}
          value={typedConfig.nurseryTheme || 'pastel'}
          onChange={(value) => handleSpecificChange('nurseryTheme', value)}
          columns={2}
        />
      </FormField>

      <Checkbox
        checked={typedConfig.showArabicLabel ?? true}
        onChange={(checked) => handleSpecificChange('showArabicLabel', checked)}
        label="Show Arabic word 'رَضَّاعَة' (baby bottle)"
      />
    </DragToTargetBaseForm>
  );
}
