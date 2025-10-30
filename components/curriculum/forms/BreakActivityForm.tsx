import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, NumberInput } from './FormField';
import { OptionSelector } from './OptionSelector';
import type { BreakTimeMiniGameConfig } from '@/lib/types/activity-configs';

export function BreakActivityForm({ config, onChange }: BaseActivityFormProps<BreakTimeMiniGameConfig>) {
  const variant = config?.variant || 'tracing_lines';
  const duration = config?.duration || 30;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  const breakTypeOptions = [
    { value: 'tracing_lines', label: 'Tracing Lines', icon: '✏️' },
    { value: 'dot_tapping', label: 'Dot Tapping', icon: '👆' },
    { value: 'coloring', label: 'Coloring', icon: '🎨' },
    { value: 'memory_game', label: 'Memory Game', icon: '🧠' },
  ];

  // Only coloring and memory_game need duration
  const needsDuration = variant === 'coloring' || variant === 'memory_game';

  return (
    <div className="space-y-4">

      <FormField label="Break Type" required hint="Type of break activity">
        <OptionSelector
          value={variant}
          onChange={(value) => updateConfig({ variant: value })}
          options={breakTypeOptions}
        />
      </FormField>

      {needsDuration && (
        <FormField label="Duration (seconds)" hint="How long the break activity should last">
          <NumberInput
            value={duration}
            onChange={(value) => updateConfig({ duration: value })}
            min={10}
          />
        </FormField>
      )}
    </div>
  );
}
