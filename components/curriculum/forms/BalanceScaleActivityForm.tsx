/**
 * BalanceScaleActivityForm - Configuration form for Balance Scale activity
 *
 * Students drag items with the target letter onto a scale (مِيزَان) to balance it.
 * Teaches the Arabic word for scale/balance.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { DragToTargetBaseForm, DragToTargetConfig } from './shared/DragToTargetBaseForm';
import { FormField, Checkbox } from './FormField';
import { OptionSelector } from './OptionSelector';

interface BalanceScaleConfig extends DragToTargetConfig {
  scaleStyle?: 'classic' | 'modern' | 'cartoon';
  itemShape?: 'circles' | 'squares' | 'weights';
  showTiltAnimation?: boolean;
  showArabicLabel?: boolean;
}

export function BalanceScaleActivityForm({ config, onChange }: BaseActivityFormProps) {
  const typedConfig = (config || {}) as Partial<BalanceScaleConfig>;

  const handleSpecificChange = (key: keyof BalanceScaleConfig, value: any) => {
    onChange({ ...typedConfig, [key]: value });
  };

  return (
    <DragToTargetBaseForm<BalanceScaleConfig>
      config={typedConfig}
      onChange={onChange}
      itemLabel="items"
      targetLabel="the scale"
      defaultTargetCount={4}
      defaultTotalItems={8}
    >
      <FormField label="Scale Style">
        <OptionSelector
          options={[
            { value: 'classic', label: 'Classic', icon: '⚖️', description: 'Traditional balance' },
            { value: 'modern', label: 'Modern', icon: '🔬', description: 'Digital style' },
            { value: 'cartoon', label: 'Cartoon', icon: '🎨', description: 'Fun cartoon' },
          ]}
          value={typedConfig.scaleStyle || 'classic'}
          onChange={(value) => handleSpecificChange('scaleStyle', value)}
          columns={3}
        />
      </FormField>

      <FormField label="Item Shape" hint="Shape of draggable items">
        <OptionSelector
          options={[
            { value: 'circles', label: 'Circles', icon: '⭕' },
            { value: 'squares', label: 'Squares', icon: '🔲' },
            { value: 'weights', label: 'Weights', icon: '🏋️' },
          ]}
          value={typedConfig.itemShape || 'circles'}
          onChange={(value) => handleSpecificChange('itemShape', value)}
          columns={3}
        />
      </FormField>

      <div className="space-y-3">
        <Checkbox
          checked={typedConfig.showTiltAnimation ?? true}
          onChange={(checked) => handleSpecificChange('showTiltAnimation', checked)}
          label="Show scale tilt animation as items are added"
        />

        <Checkbox
          checked={typedConfig.showArabicLabel ?? true}
          onChange={(checked) => handleSpecificChange('showArabicLabel', checked)}
          label="Show Arabic word 'مِيزَان' (scale/balance)"
        />
      </div>
    </DragToTargetBaseForm>
  );
}
