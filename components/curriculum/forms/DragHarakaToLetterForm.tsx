import React, { useState } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField } from './FormField';
import { LetterSelector } from './shared/LetterSelector';
import { type LetterReference } from './ArabicLetterGrid';
import { useLetters } from '@/lib/hooks/useLetters';
import { cn } from '@/lib/utils';
import type { HarakaType } from '@/lib/types/activity-configs';

/**
 * Haraka types with labels and display characters
 */
const HARAKA_OPTIONS: { value: HarakaType; label: string; arabic: string; char: string; position: 'above' | 'below' }[] = [
  { value: 'fatha', label: 'Fatha', arabic: 'فَتْحَة', char: '\u064E', position: 'above' },
  { value: 'damma', label: 'Damma', arabic: 'ضَمَّة', char: '\u064F', position: 'above' },
  { value: 'kasra', label: 'Kasra', arabic: 'كَسْرَة', char: '\u0650', position: 'below' },
  { value: 'sukoon', label: 'Sukoon', arabic: 'سُكُون', char: '\u0652', position: 'above' },
  { value: 'shadda', label: 'Shadda', arabic: 'شَدَّة', char: '\u0651', position: 'above' },
];

/**
 * Get the display letter with haraka applied
 */
function applyHaraka(letter: string, haraka: HarakaType): string {
  const harakaChar = HARAKA_OPTIONS.find(h => h.value === haraka)?.char || '';
  return letter + harakaChar;
}

export function DragHarakaToLetterForm({ config, onChange, topic }: BaseActivityFormProps) {
  const { letters } = useLetters();
  const [useDistractors, setUseDistractors] = useState(
    Array.isArray(config?.distractorLetters) && config.distractorLetters.length > 0
  );

  // targetLetter is stored as a LetterReference
  const targetLetter: LetterReference | null = config?.targetLetter || null;
  const harakaType: HarakaType = config?.harakaType || 'fatha';
  const distractorLetters: LetterReference[] = config?.distractorLetters || [];

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  // Get the display character for a letter reference
  const getLetterDisplay = (ref: LetterReference | null): string => {
    if (!ref) return '';
    const letterData = letters.find(l => l.id === ref.letterId);
    if (!letterData) return '';
    // Get the specific form
    const forms = letterData.forms as Record<string, string> | undefined;
    return forms?.[ref.form] || letterData.letter || '';
  };

  const targetLetterDisplay = getLetterDisplay(targetLetter);
  const harakaInfo = HARAKA_OPTIONS.find(h => h.value === harakaType);

  return (
    <div className="space-y-6">
      {/* Haraka Type Selector */}
      <FormField
        label="Haraka Type"
        hint="The diacritical mark students will drag onto the letter"
        required
      >
        <div className="grid grid-cols-5 gap-2">
          {HARAKA_OPTIONS.map((haraka) => (
            <button
              key={haraka.value}
              type="button"
              onClick={() => updateConfig({ harakaType: haraka.value })}
              className={cn(
                'flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all',
                harakaType === haraka.value
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              )}
            >
              <span className="text-3xl font-arabic mb-1">
                {'ب' + haraka.char}
              </span>
              <span className="text-xs font-medium text-gray-700">{haraka.label}</span>
              <span className="text-xs text-gray-500 font-arabic">{haraka.arabic}</span>
            </button>
          ))}
        </div>
      </FormField>

      {/* Target Letter */}
      <FormField
        label="Target Letter"
        hint="The letter to place the haraka on"
        required
      >
        <LetterSelector
          value={targetLetter}
          onChange={(value) => updateConfig({ targetLetter: value })}
          topic={topic}
          showFormSelector={true}
        />
      </FormField>

      {/* Multi-letter Mode Toggle */}
      <FormField
        label="Activity Mode"
        hint="Choose between single letter or multi-letter mode"
      >
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="activityMode"
              checked={!useDistractors}
              onChange={() => {
                setUseDistractors(false);
                updateConfig({ distractorLetters: undefined });
              }}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">Single Letter</span>
            <span className="text-xs text-gray-500">(One letter shown)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="activityMode"
              checked={useDistractors}
              onChange={() => setUseDistractors(true)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">Multi-letter</span>
            <span className="text-xs text-gray-500">(Scattered letters)</span>
          </label>
        </div>
      </FormField>

      {/* Distractor Letters (only in multi-letter mode) */}
      {useDistractors && (
        <FormField
          label="Distractor Letters"
          hint="Wrong letters scattered around (2-6 letters)"
        >
          <LetterSelector
            value={distractorLetters}
            onChange={(value) => updateConfig({ distractorLetters: value })}
            topic={topic}
            multiSelect
            showFormSelector={true}
            disabledLetterIds={targetLetter ? [targetLetter.letterId] : []}
          />
        </FormField>
      )}

      {/* Preview */}
      {targetLetter && harakaType && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-3">Preview</p>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Students drag</p>
              <span
                className="text-5xl font-arabic text-blue-600"
                style={{ color: '#E91E63' }}
              >
                {harakaInfo?.char}
              </span>
              <p className="text-xs text-gray-500 mt-1">{harakaInfo?.label}</p>
            </div>
            <div className="text-2xl text-gray-400">→</div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">To the letter</p>
              <span className="text-5xl font-arabic">{targetLetterDisplay}</span>
            </div>
            <div className="text-2xl text-gray-400">=</div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Result</p>
              <span className="text-5xl font-arabic">
                {applyHaraka(targetLetterDisplay, harakaType)}
              </span>
            </div>
          </div>
          {useDistractors && distractorLetters.length > 0 && (
            <div className="mt-4 pt-3 border-t border-blue-200">
              <p className="text-xs text-gray-500 mb-2">
                Scattered letters (one correct + {distractorLetters.length} distractors)
              </p>
              <div className="flex gap-3 flex-wrap">
                <span className="text-2xl font-arabic px-3 py-1 bg-green-100 rounded border border-green-300">
                  {targetLetterDisplay}
                </span>
                {distractorLetters.map((ref, i) => (
                  <span key={i} className="text-2xl font-arabic px-3 py-1 bg-gray-100 rounded border border-gray-300">
                    {getLetterDisplay(ref)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
