/**
 * PiggyBankActivityForm - Configuration form for Piggy Bank activity
 *
 * Students drag coins (عُمْلَة) with the target letter into a piggy bank (حَصَّالَة).
 * Teaches Arabic words for coin and piggy bank.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { DragToTargetBaseForm, DragToTargetConfig } from './shared/DragToTargetBaseForm';
import { FormField, Checkbox } from './FormField';
import { OptionSelector } from './OptionSelector';

interface PiggyBankConfig extends DragToTargetConfig {
  piggyColor?: 'pink' | 'gold' | 'blue';
  coinStyle?: 'gold' | 'silver' | 'mixed';
  showArabicLabels?: boolean;
}

export function PiggyBankActivityForm({ config, onChange }: BaseActivityFormProps) {
  const typedConfig = (config || {}) as Partial<PiggyBankConfig>;

  const handleSpecificChange = (key: keyof PiggyBankConfig, value: any) => {
    onChange({ ...typedConfig, [key]: value });
  };

  return (
    <DragToTargetBaseForm<PiggyBankConfig>
      config={typedConfig}
      onChange={onChange}
      itemLabel="coins"
      targetLabel="the piggy bank"
      defaultTargetCount={4}
      defaultTotalItems={8}
    >
      <FormField label="Piggy Bank Color">
        <OptionSelector
          options={[
            { value: 'pink', label: 'Pink', icon: '🐷' },
            { value: 'gold', label: 'Gold', icon: '🏦' },
            { value: 'blue', label: 'Blue', icon: '🐽' },
          ]}
          value={typedConfig.piggyColor || 'pink'}
          onChange={(value) => handleSpecificChange('piggyColor', value)}
          columns={3}
        />
      </FormField>

      <FormField label="Coin Style">
        <OptionSelector
          options={[
            { value: 'gold', label: 'Gold Coins', icon: '🪙' },
            { value: 'silver', label: 'Silver Coins', icon: '⚪' },
            { value: 'mixed', label: 'Mixed', icon: '💰' },
          ]}
          value={typedConfig.coinStyle || 'gold'}
          onChange={(value) => handleSpecificChange('coinStyle', value)}
          columns={3}
        />
      </FormField>

      <Checkbox
        checked={typedConfig.showArabicLabels ?? true}
        onChange={(checked) => handleSpecificChange('showArabicLabels', checked)}
        label="Show Arabic words 'عُمْلَة' (coin) and 'حَصَّالَة' (piggy bank)"
      />
    </DragToTargetBaseForm>
  );
}
