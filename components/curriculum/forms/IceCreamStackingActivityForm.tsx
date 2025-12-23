/**
 * IceCreamStackingActivityForm - Configuration form for Ice Cream Stacking activity
 *
 * Students drag ice cream scoops with the target letter onto a cone
 * to build an ice cream tower.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { DragToTargetBaseForm, DragToTargetConfig } from './shared/DragToTargetBaseForm';
import { FormField, Checkbox, NumberInput } from './FormField';
import { OptionSelector } from './OptionSelector';

interface IceCreamStackingConfig extends DragToTargetConfig {
  coneStyle?: 'waffle' | 'sugar' | 'wafer';
  scoopColors?: 'pastel' | 'vibrant' | 'rainbow';
  maxStackHeight?: number;
  showStackAnimation?: boolean;
}

export function IceCreamStackingActivityForm({ config, onChange }: BaseActivityFormProps) {
  const typedConfig = (config || {}) as Partial<IceCreamStackingConfig>;

  const handleSpecificChange = (key: keyof IceCreamStackingConfig, value: any) => {
    onChange({ ...typedConfig, [key]: value });
  };

  return (
    <DragToTargetBaseForm<IceCreamStackingConfig>
      config={typedConfig}
      onChange={onChange}
      itemLabel="scoops"
      targetLabel="the cone"
      defaultTargetCount={3}
      defaultTotalItems={6}
    >
      <FormField label="Cone Style">
        <OptionSelector
          options={[
            { value: 'waffle', label: 'Waffle Cone', icon: '🍦', description: 'Crunchy waffle' },
            { value: 'sugar', label: 'Sugar Cone', icon: '🧁', description: 'Sweet sugar' },
            { value: 'wafer', label: 'Wafer Cone', icon: '🍨', description: 'Light wafer' },
          ]}
          value={typedConfig.coneStyle || 'waffle'}
          onChange={(value) => handleSpecificChange('coneStyle', value)}
          columns={3}
        />
      </FormField>

      <FormField label="Scoop Colors">
        <OptionSelector
          options={[
            { value: 'pastel', label: 'Pastel', icon: '🎀', description: 'Soft colors' },
            { value: 'vibrant', label: 'Vibrant', icon: '🌟', description: 'Bright colors' },
            { value: 'rainbow', label: 'Rainbow', icon: '🌈', description: 'All colors' },
          ]}
          value={typedConfig.scoopColors || 'pastel'}
          onChange={(value) => handleSpecificChange('scoopColors', value)}
          columns={3}
        />
      </FormField>

      <FormField label="Max Stack Height" hint="Maximum scoops that can be stacked">
        <NumberInput
          value={typedConfig.maxStackHeight ?? 5}
          onChange={(value) => handleSpecificChange('maxStackHeight', value)}
          min={2}
          max={8}
        />
      </FormField>

      <Checkbox
        checked={typedConfig.showStackAnimation ?? true}
        onChange={(checked) => handleSpecificChange('showStackAnimation', checked)}
        label="Show stacking animation when scoop is added"
      />
    </DragToTargetBaseForm>
  );
}
