import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput, TextArea, Select } from './FormField';

export function MultipleChoiceActivityForm({ config, onChange }: BaseActivityFormProps) {
  const questionEn = config?.question?.en || '';
  const questionAr = config?.question?.ar || '';
  const options = config?.options || [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ];
  const layout = config?.layout || 'vertical';

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  const updateOption = (index: number, updates: Partial<typeof options[0]>) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    updateConfig({ options: newOptions });
  };

  const addOption = () => {
    updateConfig({ options: [...options, { text: '', isCorrect: false }] });
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_: any, i: number) => i !== index);
      updateConfig({ options: newOptions });
    }
  };

  return (
    <div className="space-y-4">
      <FormField label="Question (English)" required hint="The question to ask">
        <TextArea
          value={questionEn}
          onChange={(value) => updateConfig({ question: { ...config?.question, en: value } })}
          required
          placeholder="What letter is this?"
          rows={2}
        />
      </FormField>

      <FormField label="Question (Arabic)" required hint="السؤال بالعربية">
        <TextArea
          value={questionAr}
          onChange={(value) => updateConfig({ question: { ...config?.question, ar: value } })}
          required
          dir="rtl"
          placeholder="ما هذا الحرف؟"
          rows={2}
        />
      </FormField>

      <FormField label="Layout" hint="How options are displayed">
        <Select
          value={layout}
          onChange={(value) => updateConfig({ layout: value })}
          options={[
            { value: 'vertical', label: 'Vertical' },
            { value: 'horizontal', label: 'Horizontal' },
            { value: 'grid', label: 'Grid' },
          ]}
        />
      </FormField>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Options <span className="text-red-500">*</span>
        </label>
        {options.map((option: any, index: number) => (
          <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-md">
            <div className="flex-1">
              <TextInput
                value={option.text}
                onChange={(value) => updateOption(index, { text: value })}
                required
                dir="rtl"
                placeholder={`Option ${index + 1}`}
              />
            </div>
            <label className="flex items-center gap-2 whitespace-nowrap">
              <input
                type="checkbox"
                checked={option.isCorrect}
                onChange={(e) => updateOption(index, { isCorrect: e.target.checked })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Correct</span>
            </label>
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addOption}
          className="w-full px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
        >
          + Add Option
        </button>
      </div>
    </div>
  );
}
