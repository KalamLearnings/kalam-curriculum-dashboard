/**
 * SnowflakesActivityForm - Configuration form for Snowflakes activity
 *
 * Physics-based activity where students catch falling snowflakes (ثَلْج)
 * containing the target letter.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, NumberInput, Checkbox, TextInput } from './FormField';
import { LetterSelector } from './shared/LetterSelector';
import { OptionSelector } from './OptionSelector';

interface SnowflakesConfig {
  targetLetter: string;
  distractorLetters?: string[];
  targetCount?: number;
  speed?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  showArabicLabel?: boolean;
}

export function SnowflakesActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  const typedConfig = (config || {}) as Partial<SnowflakesConfig>;
  const distractors = typedConfig.distractorLetters || [];
  const distractorLettersStr = Array.isArray(distractors) ? distractors.join(', ') : '';

  const handleChange = (key: keyof SnowflakesConfig, value: any) => {
    onChange({ ...typedConfig, [key]: value });
  };

  return (
    <div className="space-y-6">
      <FormField label="Target Letter" hint="The letter on snowflakes to catch" required>
        <LetterSelector
          value={typedConfig.targetLetter || ''}
          onChange={(value) => handleChange('targetLetter', value)}
          topic={topic}
        />
      </FormField>

      <FormField label="Distractor Letters" hint="Wrong letters (comma-separated)">
        <TextInput
          value={distractorLettersStr}
          onChange={(value) => {
            const letters = value.split(',').map(l => l.trim()).filter(l => l);
            handleChange('distractorLetters', letters);
          }}
          placeholder="ب, ت, ث"
          dir="rtl"
        />
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
