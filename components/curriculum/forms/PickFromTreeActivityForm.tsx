/**
 * PickFromTreeActivityForm - Configuration form for Pick From Tree activity
 *
 * Students tap on fruits from a tree that contain the target letter.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { TapActivityBaseForm, TapActivityConfig } from './shared/TapActivityBaseForm';
import { FormField } from './FormField';
import { OptionSelector } from './OptionSelector';

interface PickFromTreeConfig extends TapActivityConfig {
  fruitType?: 'apple' | 'orange' | 'lemon' | 'mixed';
  treeStyle?: 'spring' | 'summer' | 'autumn';
}

export function PickFromTreeActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  const typedConfig = (config || {}) as Partial<PickFromTreeConfig>;

  const handleSpecificChange = (key: keyof PickFromTreeConfig, value: any) => {
    onChange({ ...typedConfig, [key]: value });
  };

  return (
    <TapActivityBaseForm<PickFromTreeConfig>
      config={typedConfig}
      onChange={onChange}
      topic={topic}
      itemLabel="fruits"
      defaultTargetCount={4}
      defaultTotalItems={8}
    >
      <FormField label="Fruit Type" hint="Type of fruit to display on tree">
        <OptionSelector
          options={[
            { value: 'apple', label: 'Apples', icon: '🍎' },
            { value: 'orange', label: 'Oranges', icon: '🍊' },
            { value: 'lemon', label: 'Lemons', icon: '🍋' },
            { value: 'mixed', label: 'Mixed', icon: '🍇' },
          ]}
          value={typedConfig.fruitType || 'apple'}
          onChange={(value) => handleSpecificChange('fruitType', value)}
        />
      </FormField>

      <FormField label="Tree Style" hint="Season appearance of the tree">
        <OptionSelector
          options={[
            { value: 'spring', label: 'Spring', icon: '🌸', description: 'Pink blossoms' },
            { value: 'summer', label: 'Summer', icon: '🌳', description: 'Green leaves' },
            { value: 'autumn', label: 'Autumn', icon: '🍂', description: 'Orange leaves' },
          ]}
          value={typedConfig.treeStyle || 'summer'}
          onChange={(value) => handleSpecificChange('treeStyle', value)}
          columns={3}
        />
      </FormField>
    </TapActivityBaseForm>
  );
}
