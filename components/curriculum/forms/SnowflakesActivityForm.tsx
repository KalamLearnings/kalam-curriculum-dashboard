/**
 * SnowflakesActivityForm - Configuration form for Snowflakes activity
 *
 * Physics-based activity where students catch falling snowflakes (ثَلْج)
 * containing the target letter.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, NumberInput, Checkbox } from './FormField';
import { LetterSelector } from '../LetterSelector';
import { OptionSelector } from './OptionSelector';

interface SnowflakesConfig {
  targetLetter: string;
  distractorLetters?: string[];
  targetCount?: number;
  speed?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  showArabicLabel?: boolean;
}

export function SnowflakesActivityForm({ config, onChange }: BaseActivityFormProps) {
  const typedConfig = (config || {}) as Partial<SnowflakesConfig>;
  const distractors = typedConfig.distractorLetters || [];

  const handleChange = (key: keyof SnowflakesConfig, value: any) => {
    onChange({ ...typedConfig, [key]: value });
  };

  const addDistractor = (letter: any) => {
    if (letter && !distractors.includes(letter.id)) {
      handleChange('distractorLetters', [...distractors, letter.id]);
    }
  };

  const removeDistractor = (letterId: string) => {
    handleChange('distractorLetters', distractors.filter((d) => d !== letterId));
  };

  return (
    <div className="space-y-6">
      <FormField label="Target Letter" hint="The letter on snowflakes to catch" required>
        <LetterSelector
          value={typedConfig.targetLetter || ''}
          onChange={(letter) => handleChange('targetLetter', letter?.id)}
        />
      </FormField>

      <FormField label="Distractor Letters" hint="Letters on snowflakes to avoid">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {distractors.map((d) => (
              <span
                key={d}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800"
              >
                {d}
                <button
                  type="button"
                  onClick={() => removeDistractor(d)}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-cyan-400 hover:bg-cyan-200 hover:text-cyan-500 focus:outline-none"
                >
                  x
                </button>
              </span>
            ))}
            {distractors.length === 0 && (
              <span className="text-sm text-gray-500 italic">
                No distractors selected (will auto-generate)
              </span>
            )}
          </div>
          <LetterSelector
            value=""
            onChange={(letter) => addDistractor(letter)}
            label="Add Distractor"
          />
        </div>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Target Count" hint="Snowflakes to catch to win">
          <NumberInput
            value={typedConfig.targetCount ?? 5}
            onChange={(value) => handleChange('targetCount', value)}
            min={3}
            max={15}
          />
        </FormField>

        <FormField label="Fall Speed" hint="1.0 = Normal, 2.0 = Fast">
          <NumberInput
            value={typedConfig.speed ?? 1.0}
            onChange={(value) => handleChange('speed', value)}
            min={0.5}
            max={3.0}
            step={0.1}
          />
        </FormField>
      </div>

      <FormField label="Difficulty">
        <OptionSelector
          options={[
            { value: 'easy', label: 'Easy', icon: '❄️', description: 'Slower fall, fewer distractors' },
            { value: 'medium', label: 'Medium', icon: '🌨️', description: 'Normal speed' },
            { value: 'hard', label: 'Hard', icon: '⛈️', description: 'Fast fall, more distractors' },
          ]}
          value={typedConfig.difficulty || 'medium'}
          onChange={(value) => handleChange('difficulty', value)}
          columns={3}
        />
      </FormField>

      <Checkbox
        checked={typedConfig.showArabicLabel ?? true}
        onChange={(checked) => handleChange('showArabicLabel', checked)}
        label="Show Arabic word 'ثَلْج' (snow)"
      />
    </div>
  );
}
