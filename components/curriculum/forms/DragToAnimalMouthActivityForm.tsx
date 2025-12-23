/**
 * DragToAnimalMouthActivityForm - Configuration form for Drag To Animal Mouth activity
 *
 * Students drag food items with the target letter to feed an animal.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { DragToTargetBaseForm, DragToTargetConfig } from './shared/DragToTargetBaseForm';
import { FormField } from './FormField';
import { OptionSelector } from './OptionSelector';

interface DragToAnimalMouthConfig extends DragToTargetConfig {
  animalType?: 'dog' | 'cat' | 'bird' | 'lion';
  foodType?: 'generic' | 'bones' | 'fish' | 'seeds';
}

export function DragToAnimalMouthActivityForm({ config, onChange }: BaseActivityFormProps) {
  const typedConfig = (config || {}) as Partial<DragToAnimalMouthConfig>;

  const handleSpecificChange = (key: keyof DragToAnimalMouthConfig, value: any) => {
    onChange({ ...typedConfig, [key]: value });
  };

  return (
    <DragToTargetBaseForm<DragToAnimalMouthConfig>
      config={typedConfig}
      onChange={onChange}
      itemLabel="food items"
      targetLabel="the animal"
      defaultTargetCount={4}
      defaultTotalItems={8}
    >
      <FormField label="Animal Type" hint="Choose the animal to feed">
        <OptionSelector
          options={[
            { value: 'dog', label: 'Dog', icon: '🐕', description: 'Friendly puppy' },
            { value: 'cat', label: 'Cat', icon: '🐱', description: 'Cute kitten' },
            { value: 'bird', label: 'Bird', icon: '🐦', description: 'Hungry bird' },
            { value: 'lion', label: 'Lion', icon: '🦁', description: 'Brave lion' },
          ]}
          value={typedConfig.animalType || 'dog'}
          onChange={(value) => handleSpecificChange('animalType', value)}
        />
      </FormField>

      <FormField label="Food Type" hint="Type of food items to drag">
        <OptionSelector
          options={[
            { value: 'generic', label: 'Generic', icon: '🍖' },
            { value: 'bones', label: 'Bones', icon: '🦴' },
            { value: 'fish', label: 'Fish', icon: '🐟' },
            { value: 'seeds', label: 'Seeds', icon: '🌾' },
          ]}
          value={typedConfig.foodType || 'generic'}
          onChange={(value) => handleSpecificChange('foodType', value)}
        />
      </FormField>
    </DragToTargetBaseForm>
  );
}
