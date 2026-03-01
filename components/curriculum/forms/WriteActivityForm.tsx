import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, NumberInput } from './FormField';
import { LetterSelector } from './shared/LetterSelector';
import type { LetterReference } from './ArabicLetterGrid';

export function WriteActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  const typedConfig = config as any;
  // targetLetter is a LetterReference object
  const targetLetter: LetterReference | null = typedConfig?.targetLetter || null;
  const mode = typedConfig?.mode || 'guided';
  const traceCount = typedConfig?.traceCount || 3;

  const updateConfig = (updates: Record<string, any>) => {
    onChange({ ...config, ...updates } as any);
  };

  return (
    <div className="space-y-4">
      <FormField label="Letter" hint="The Arabic letter and form to trace" required>
        <LetterSelector
          value={targetLetter}
          onChange={(value) => updateConfig({ targetLetter: value })}
          topic={topic}
          showFormSelector={true}
        />
      </FormField>

      <FormField label="Writing Mode" required hint="Choose how students trace the letter">
        <div className="space-y-3">
          {/* Radio buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => updateConfig({ mode: 'guided' })}
              className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                mode === 'guided'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  mode === 'guided' ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {mode === 'guided' && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <span className="text-sm font-medium">Guided</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-6">With guide path and stroke order</p>
            </button>

            <button
              type="button"
              onClick={() => updateConfig({ mode: 'freehand' })}
              className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                mode === 'freehand'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  mode === 'freehand' ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {mode === 'freehand' && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <span className="text-sm font-medium">Freehand</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-6">No guide, free drawing</p>
            </button>
          </div>
        </div>
      </FormField>

      <FormField label="Trace Count" hint="Number of times to trace">
        <NumberInput
          value={traceCount}
          onChange={(value) => updateConfig({ traceCount: value })}
          min={1}
        />
      </FormField>
    </div>
  );
}
