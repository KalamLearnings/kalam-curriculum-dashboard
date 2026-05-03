import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField } from './FormField';
import { AudioPicker } from '@/components/audio/AudioPicker';
import { cn } from '@/lib/utils';
import type { CamelNarrationConfig, NarrationStep, CamelPose } from '@/lib/types/activity-configs';
import type { AudioAsset } from '@/lib/types/audio';

const POSE_OPTIONS: { value: CamelPose; label: string; emoji: string }[] = [
  { value: 'idle', label: 'Idle', emoji: '😌' },
  { value: 'wave', label: 'Wave', emoji: '👋' },
  { value: 'celebrating', label: 'Celebrating', emoji: '🎉' },
  { value: 'clapping', label: 'Clapping', emoji: '👏' },
  { value: 'thinking', label: 'Thinking', emoji: '🤔' },
  { value: 'listening', label: 'Listening', emoji: '👂' },
  { value: 'dancing', label: 'Dancing', emoji: '💃' },
];

export function CamelNarrationActivityForm({ config, onChange }: BaseActivityFormProps<CamelNarrationConfig>) {
  const narrationSteps = config?.narrationSteps || [];

  const updateConfig = (updates: Partial<CamelNarrationConfig>) => {
    onChange({ ...config, ...updates });
  };

  const addStep = () => {
    const newStep: NarrationStep = {
      audioId: '',
      pose: 'idle',
    };
    updateConfig({ narrationSteps: [...narrationSteps, newStep] });
  };

  const removeStep = (index: number) => {
    const updated = narrationSteps.filter((_, i) => i !== index);
    updateConfig({ narrationSteps: updated });
  };

  const updateStep = (index: number, updates: Partial<NarrationStep>) => {
    const updated = narrationSteps.map((step, i) =>
      i === index ? { ...step, ...updates } : step
    );
    updateConfig({ narrationSteps: updated });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= narrationSteps.length) return;

    const updated = [...narrationSteps];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updateConfig({ narrationSteps: updated });
  };

  const handleAudioSelect = (index: number, audioId: string | undefined, audio?: AudioAsset) => {
    updateStep(index, {
      audioId: audioId || '',
      audioUrl: audio?.url,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Add audio clips that the camel mascot will narrate in sequence.
        </p>
        <button
          type="button"
          onClick={addStep}
          className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
        >
          + Add Step
        </button>
      </div>

      {narrationSteps.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">No narration steps yet</p>
          <button
            type="button"
            onClick={addStep}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Add your first step
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {narrationSteps.map((step, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-700 text-sm">
                  Step {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveStep(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(index, 'down')}
                    disabled={index === narrationSteps.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="p-1 text-red-400 hover:text-red-600"
                    title="Remove step"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-[1fr,auto] gap-4 items-start">
                {/* Audio Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Audio</label>
                  <AudioPicker
                    value={step.audioId}
                    onChange={(audioId, audio) => handleAudioSelect(index, audioId, audio)}
                    placeholder="Select narration audio..."
                  />
                </div>

                {/* Pose Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Pose</label>
                  <div className="flex gap-1">
                    {POSE_OPTIONS.map((pose) => (
                      <button
                        key={pose.value}
                        type="button"
                        onClick={() => updateStep(index, { pose: pose.value })}
                        className={cn(
                          'p-2 rounded-lg border-2 transition-all',
                          step.pose === pose.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        )}
                        title={pose.label}
                      >
                        <span className="text-lg">{pose.emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {narrationSteps.length > 0 && (
        <p className="text-xs text-gray-500">
          {narrationSteps.length} step{narrationSteps.length !== 1 ? 's' : ''} will play in sequence.
        </p>
      )}
    </div>
  );
}
