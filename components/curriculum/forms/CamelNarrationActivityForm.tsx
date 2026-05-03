import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField } from './FormField';
import { AudioPicker } from '@/components/audio/AudioPicker';
import { cn } from '@/lib/utils';
import type { CamelNarrationConfig, NarrationStep } from '@/lib/types/activity-configs';
import type { AudioAsset } from '@/lib/types/audio';

export function CamelNarrationActivityForm({ config, onChange }: BaseActivityFormProps<CamelNarrationConfig>) {
  const narrationSteps = config?.narrationSteps || [];

  const handleAudioChange = (audioId: string | undefined, audio?: AudioAsset) => {
    if (audioId && audio) {
      // Add or update the single narration step
      const newStep: NarrationStep = {
        audioId,
        audioUrl: audio.url,
        pose: 'wave',
      };
      onChange({ ...config, narrationSteps: [newStep] });
    } else {
      // Clear narration
      onChange({ ...config, narrationSteps: [] });
    }
  };

  const currentAudioId = narrationSteps[0]?.audioId;
  const hasAudio = !!currentAudioId;

  return (
    <div className="space-y-4">
      <FormField
        label="Narration Audio"
        hint="Select the audio clip the camel mascot will speak"
        required
      >
        <div
          className={cn(
            'p-3 rounded-lg border-2 transition-all',
            hasAudio
              ? 'border-purple-400 bg-purple-50'
              : 'border-orange-300 bg-orange-50'
          )}
        >
          <AudioPicker
            value={currentAudioId}
            onChange={handleAudioChange}
            placeholder="Select narration audio..."
          />
          {!hasAudio && (
            <p className="text-xs text-orange-600 mt-2">
              Audio required for the mascot to narrate
            </p>
          )}
        </div>
      </FormField>
    </div>
  );
}
