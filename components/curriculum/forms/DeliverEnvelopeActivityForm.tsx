/**
 * DeliverEnvelopeActivityForm - Configuration form for Deliver Envelope activity
 *
 * Students tap on houses with the target letter to deliver envelopes (ظَرْف).
 * Teaches the Arabic word for envelope.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { TapActivityBaseForm, TapActivityConfig } from './shared/TapActivityBaseForm';
import { FormField, Checkbox } from './FormField';
import { OptionSelector } from './OptionSelector';

interface DeliverEnvelopeConfig extends TapActivityConfig {
  neighborhoodStyle?: 'suburban' | 'urban' | 'rural';
  weatherTheme?: 'sunny' | 'cloudy' | 'evening';
  showArabicLabel?: boolean;
}

export function DeliverEnvelopeActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  const typedConfig = (config || {}) as Partial<DeliverEnvelopeConfig>;

  const handleSpecificChange = (key: keyof DeliverEnvelopeConfig, value: any) => {
    onChange({ ...typedConfig, [key]: value });
  };

  return (
    <TapActivityBaseForm<DeliverEnvelopeConfig>
      config={typedConfig}
      onChange={onChange}
      topic={topic}
      itemLabel="houses"
      defaultTargetCount={3}
      defaultTotalItems={6}
    >
      <FormField label="Neighborhood Style">
        <OptionSelector
          options={[
            { value: 'suburban', label: 'Suburban', icon: '🏠', description: 'Family homes' },
            { value: 'urban', label: 'Urban', icon: '🏢', description: 'City buildings' },
            { value: 'rural', label: 'Rural', icon: '🏡', description: 'Countryside' },
          ]}
          value={typedConfig.neighborhoodStyle || 'suburban'}
          onChange={(value) => handleSpecificChange('neighborhoodStyle', value)}
          columns={3}
        />
      </FormField>

      <FormField label="Weather/Time">
        <OptionSelector
          options={[
            { value: 'sunny', label: 'Sunny Day', icon: '☀️' },
            { value: 'cloudy', label: 'Cloudy', icon: '☁️' },
            { value: 'evening', label: 'Evening', icon: '🌅' },
          ]}
          value={typedConfig.weatherTheme || 'sunny'}
          onChange={(value) => handleSpecificChange('weatherTheme', value)}
          columns={3}
        />
      </FormField>

      <Checkbox
        checked={typedConfig.showArabicLabel ?? true}
        onChange={(checked) => handleSpecificChange('showArabicLabel', checked)}
        label="Show Arabic word 'ظَرْف' (envelope)"
      />
    </TapActivityBaseForm>
  );
}
