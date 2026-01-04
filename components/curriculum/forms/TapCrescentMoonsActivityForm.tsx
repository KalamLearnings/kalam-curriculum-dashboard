/**
 * TapCrescentMoonsActivityForm - Configuration form for Tap Crescent Moons activity
 *
 * Night sky themed activity where students tap on crescent moons (هِلَال)
 * containing the target letter.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { TapActivityBaseForm, TapActivityConfig } from './shared/TapActivityBaseForm';
import { FormField, Checkbox } from './FormField';
import { OptionSelector } from './OptionSelector';

interface TapCrescentMoonsConfig extends TapActivityConfig {
  skyTheme?: 'night' | 'twilight' | 'midnight';
  showStars?: boolean;
  showArabicLabel?: boolean;
}

export function TapCrescentMoonsActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  const typedConfig = (config || {}) as Partial<TapCrescentMoonsConfig>;

  const handleSpecificChange = (key: keyof TapCrescentMoonsConfig, value: any) => {
    onChange({ ...typedConfig, [key]: value });
  };

  return (
    <TapActivityBaseForm<TapCrescentMoonsConfig>
      config={typedConfig}
      onChange={onChange}
      topic={topic}
      itemLabel="moons"
      defaultTargetCount={3}
      defaultTotalItems={6}
    >
      <FormField label="Sky Theme" hint="Background appearance">
        <OptionSelector
          options={[
            { value: 'night', label: 'Night', icon: '🌙', description: 'Dark blue sky' },
            { value: 'twilight', label: 'Twilight', icon: '🌅', description: 'Purple gradient' },
            { value: 'midnight', label: 'Midnight', icon: '✨', description: 'Deep black' },
          ]}
          value={typedConfig.skyTheme || 'night'}
          onChange={(value) => handleSpecificChange('skyTheme', value)}
          columns={3}
        />
      </FormField>

      <div className="space-y-3">
        <Checkbox
          checked={typedConfig.showStars ?? true}
          onChange={(checked) => handleSpecificChange('showStars', checked)}
          label="Show twinkling stars in background"
        />

        <Checkbox
          checked={typedConfig.showArabicLabel ?? true}
          onChange={(checked) => handleSpecificChange('showArabicLabel', checked)}
          label="Show Arabic word 'هِلَال' (crescent moon)"
        />
      </div>
    </TapActivityBaseForm>
  );
}
