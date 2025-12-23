/**
 * BearHoneyActivityForm - Configuration form for Bear Honey activity
 *
 * Students drag honey jars (عَسَل) with the target letter to a hungry bear (دُبّ).
 * Teaches Arabic words for honey and bear.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { DragToTargetBaseForm, DragToTargetConfig } from './shared/DragToTargetBaseForm';
import { FormField, Checkbox } from './FormField';
import { OptionSelector } from './OptionSelector';

interface BearHoneyConfig extends DragToTargetConfig {
  bearStyle?: 'brown' | 'polar' | 'panda';
  forestTheme?: 'forest' | 'meadow' | 'cave';
  showArabicLabels?: boolean;
}

export function BearHoneyActivityForm({ config, onChange }: BaseActivityFormProps) {
  const typedConfig = (config || {}) as Partial<BearHoneyConfig>;

  const handleSpecificChange = (key: keyof BearHoneyConfig, value: any) => {
    onChange({ ...typedConfig, [key]: value });
  };

  return (
    <DragToTargetBaseForm<BearHoneyConfig>
      config={typedConfig}
      onChange={onChange}
      itemLabel="honey jars"
      targetLabel="the bear"
      defaultTargetCount={4}
      defaultTotalItems={8}
    >
      <FormField label="Bear Style">
        <OptionSelector
          options={[
            { value: 'brown', label: 'Brown Bear', icon: '🐻' },
            { value: 'polar', label: 'Polar Bear', icon: '🐻‍❄️' },
            { value: 'panda', label: 'Panda', icon: '🐼' },
          ]}
          value={typedConfig.bearStyle || 'brown'}
          onChange={(value) => handleSpecificChange('bearStyle', value)}
          columns={3}
        />
      </FormField>

      <FormField label="Background Theme">
        <OptionSelector
          options={[
            { value: 'forest', label: 'Forest', icon: '🌲', description: 'Green trees' },
            { value: 'meadow', label: 'Meadow', icon: '🌻', description: 'Sunny field' },
            { value: 'cave', label: 'Cave', icon: '🏔️', description: 'Rocky cave' },
          ]}
          value={typedConfig.forestTheme || 'forest'}
          onChange={(value) => handleSpecificChange('forestTheme', value)}
          columns={3}
        />
      </FormField>

      <Checkbox
        checked={typedConfig.showArabicLabels ?? true}
        onChange={(checked) => handleSpecificChange('showArabicLabels', checked)}
        label="Show Arabic words 'عَسَل' (honey) and 'دُبّ' (bear)"
      />
    </DragToTargetBaseForm>
  );
}
