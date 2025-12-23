/**
 * FeedRabbitActivityForm - Configuration form for Feed Rabbit activity
 *
 * Students drag carrots (جَزَر) with the target letter to feed a rabbit.
 * Teaches the Arabic word for carrot.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { DragToTargetBaseForm, DragToTargetConfig } from './shared/DragToTargetBaseForm';
import { FormField, Checkbox } from './FormField';
import { OptionSelector } from './OptionSelector';

interface FeedRabbitConfig extends DragToTargetConfig {
  rabbitColor?: 'white' | 'brown' | 'gray';
  showArabicLabel?: boolean;
  gardenTheme?: 'spring' | 'summer';
}

export function FeedRabbitActivityForm({ config, onChange }: BaseActivityFormProps) {
  const typedConfig = (config || {}) as Partial<FeedRabbitConfig>;

  const handleSpecificChange = (key: keyof FeedRabbitConfig, value: any) => {
    onChange({ ...typedConfig, [key]: value });
  };

  return (
    <DragToTargetBaseForm<FeedRabbitConfig>
      config={typedConfig}
      onChange={onChange}
      itemLabel="carrots"
      targetLabel="the rabbit"
      defaultTargetCount={4}
      defaultTotalItems={8}
    >
      <FormField label="Rabbit Color">
        <OptionSelector
          options={[
            { value: 'white', label: 'White', icon: '🐰' },
            { value: 'brown', label: 'Brown', icon: '🐇' },
            { value: 'gray', label: 'Gray', icon: '🐰' },
          ]}
          value={typedConfig.rabbitColor || 'white'}
          onChange={(value) => handleSpecificChange('rabbitColor', value)}
          columns={3}
        />
      </FormField>

      <FormField label="Garden Theme">
        <OptionSelector
          options={[
            { value: 'spring', label: 'Spring Garden', icon: '🌸' },
            { value: 'summer', label: 'Summer Garden', icon: '☀️' },
          ]}
          value={typedConfig.gardenTheme || 'spring'}
          onChange={(value) => handleSpecificChange('gardenTheme', value)}
          columns={2}
        />
      </FormField>

      <Checkbox
        checked={typedConfig.showArabicLabel ?? true}
        onChange={(checked) => handleSpecificChange('showArabicLabel', checked)}
        label="Show Arabic word 'جَزَر' (carrot)"
      />
    </DragToTargetBaseForm>
  );
}
