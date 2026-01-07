/**
 * Multiple Choice Activity Form
 *
 * Features:
 * - Content display toggle (Letter/Word vs Image)
 * - Answer type toggle (Text vs Image)
 * - Grid of option squares (fixed 4 options)
 * - Checkbox for correct answers (multiple supported)
 *
 * Refactored to use shared components.
 */

import React, { useState } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import {
  ModeToggle,
  TEXT_IMAGE_MODE_OPTIONS,
  ContentDisplayPicker,
  OptionsGrid,
  OptionData,
} from './shared';
import type { MultipleChoiceQuestionConfig, MultipleChoiceOption } from '@/lib/types/activity-configs';

// Content type options for display above cards
const CONTENT_TYPE_OPTIONS = [
  { value: 'text' as const, label: 'Letter/Word', icon: '📝' },
  { value: 'image' as const, label: 'Image', icon: '🖼️' },
];

export function MultipleChoiceActivityForm({ config, onChange }: BaseActivityFormProps<MultipleChoiceQuestionConfig>) {
  const questionAr = config?.question?.ar || '';
  const questionImage = config?.questionImage || '';
  const mode = config?.mode || 'text';

  // Initialize options from config or create defaults
  const initialOptions: MultipleChoiceOption[] = config?.options?.length > 0
    ? config.options
    : [
        { id: 'option_0', text: { en: '', ar: '' }, isCorrect: false },
        { id: 'option_1', text: { en: '', ar: '' }, isCorrect: false },
        { id: 'option_2', text: { en: '', ar: '' }, isCorrect: false },
        { id: 'option_3', text: { en: '', ar: '' }, isCorrect: false },
      ];

  const [options, setOptions] = useState<MultipleChoiceOption[]>(initialOptions);
  const [contentType, setContentType] = useState<'text' | 'image'>(questionImage ? 'image' : 'text');

  const updateConfig = (updates: Partial<MultipleChoiceQuestionConfig>) => {
    onChange({ ...config, ...updates });
  };

  const handleContentTypeChange = (type: 'text' | 'image') => {
    setContentType(type);
    if (type === 'image') {
      updateConfig({ question: { en: '', ar: '' } });
    } else {
      updateConfig({ questionImage: '' });
    }
  };

  const handleUpdateOption = (index: number, field: 'text' | 'image' | 'isCorrect', value: any) => {
    const newOptions = [...options];
    if (field === 'text') {
      newOptions[index].text = { en: '', ar: value };
    } else if (field === 'image') {
      newOptions[index].image = value;
    } else if (field === 'isCorrect') {
      newOptions[index].isCorrect = value;
    }
    setOptions(newOptions);
    updateConfig({ options: newOptions });
  };

  // Convert MultipleChoiceOption to OptionData for OptionsGrid
  const optionData: OptionData[] = options.map((opt) => ({
    id: opt.id,
    text: opt.text?.ar || '',
    image: opt.image,
    isCorrect: opt.isCorrect,
  }));

  return (
    <div className="space-y-6">
      {/* Content Display Type Toggle */}
      <ModeToggle
        label="Display Above Options"
        value={contentType}
        options={CONTENT_TYPE_OPTIONS}
        onChange={handleContentTypeChange}
        borderBottom
      />

      {/* Content Display Picker */}
      <div className="space-y-4">
        <ContentDisplayPicker
          contentType={contentType === 'text' ? 'letter' : 'image'}
          letter={questionAr}
          image={questionImage}
          onLetterChange={(value) => updateConfig({ question: { en: '', ar: value } })}
          onImageChange={(url) => updateConfig({ questionImage: url })}
          label={contentType === 'text' ? 'Letter or Word' : 'Image'}
          hint={contentType === 'text' ? 'Single letter or word to display' : undefined}
        />
      </div>

      {/* Answer Type Toggle */}
      <ModeToggle
        label="Answer Type"
        value={mode}
        options={TEXT_IMAGE_MODE_OPTIONS}
        onChange={(newMode) => updateConfig({ mode: newMode })}
        borderTop
      />

      {/* Answer Options Grid */}
      <OptionsGrid
        options={optionData}
        mode={mode}
        onUpdateOption={handleUpdateOption}
        title="Answer Options"
        showCorrectCheckbox
        columns={4}
      />
    </div>
  );
}
