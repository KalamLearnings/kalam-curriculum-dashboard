import React, { useState, useEffect } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, NumberInput } from './FormField';
import { LetterSelectorModal } from '../LetterSelectorModal';
import type { Letter } from '@/lib/hooks/useLetters';

export function WriteActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  const letterForm = config?.letterForm || '';
  const mode = config?.mode || 'guided';
  const traceCount = config?.traceCount || 3;

  const [showLetterSelector, setShowLetterSelector] = useState(false);

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  // Auto-populate letter from topic when component mounts or topic changes
  useEffect(() => {
    if (topic?.letter && !letterForm) {
      // Extract letter from topic.letter object (attached by backend)
      const topicLetter = topic.letter.letter;
      if (topicLetter) {
        updateConfig({ letterForm: topicLetter });
      }
    }
  }, [topic, letterForm]);

  return (
    <div className="space-y-4">

      <FormField label="Letter" hint="The Arabic letter to trace" required>
        <div className="flex items-center gap-3">
          {/* Letter Display Card */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg flex-1">
            <div className="flex items-center justify-center w-16 h-16 bg-white rounded-lg shadow-sm border border-blue-100">
              <span className="text-4xl font-arabic text-blue-900">
                {letterForm || '—'}
              </span>
            </div>
            <div className="flex-1">
              {topic?.letter ? (
                <>
                  <div className="text-sm font-medium text-gray-900">
                    {topic.letter.name_english}
                  </div>
                  <div className="text-xs text-gray-600">
                    Topic Letter • {topic.letter.name_arabic || 'All Forms'}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">
                  {letterForm ? 'Custom Letter' : 'No letter selected'}
                </div>
              )}
            </div>
          </div>

          {/* Change Button */}
          <button
            type="button"
            onClick={() => setShowLetterSelector(true)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-blue-700 bg-white border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Change
          </button>
        </div>
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

      {/* Letter Selector Modal */}
      <LetterSelectorModal
        isOpen={showLetterSelector}
        onClose={() => setShowLetterSelector(false)}
        onSelect={(selectedLetter: Letter) => {
          updateConfig({ letterForm: selectedLetter.letter });
        }}
        selectedLetter={letterForm}
      />
    </div>
  );
}
