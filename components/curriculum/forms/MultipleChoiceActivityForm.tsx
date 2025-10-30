/**
 * Multiple Choice Activity Form - Redesigned
 *
 * Features:
 * - Global mode toggle (Text vs Image)
 * - Grid of option squares
 * - Text mode: Click to edit inline
 * - Image mode: Click to open image library modal
 * - Checkbox for correct answers (multiple supported)
 */

import React, { useState } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput } from './FormField';
import { ImageLibraryModal } from './ImageLibraryModal';
import type { MultipleChoiceQuestionConfig, MultipleChoiceOption } from '@/lib/types/activity-configs';

export function MultipleChoiceActivityForm({ config, onChange }: BaseActivityFormProps<MultipleChoiceQuestionConfig>) {
  const questionEn = config?.question?.en || '';
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
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [questionImageModalOpen, setQuestionImageModalOpen] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [questionType, setQuestionType] = useState<'text' | 'image'>(questionImage ? 'image' : 'text');

  const updateConfig = (updates: Partial<MultipleChoiceQuestionConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updateMode = (newMode: 'text' | 'image') => {
    updateConfig({ mode: newMode });
  };

  const updateOption = (index: number, field: string, value: any) => {
    const newOptions = [...options];
    if (field === 'text.ar') {
      newOptions[index].text.ar = value;
    } else if (field === 'image') {
      newOptions[index].image = value;
    } else if (field === 'isCorrect') {
      newOptions[index].isCorrect = value;
    }
    setOptions(newOptions);
    updateConfig({ options: newOptions });
  };

  const openImagePicker = (index: number) => {
    setSelectedOptionIndex(index);
    setImageModalOpen(true);
  };

  const handleImageSelect = (url: string) => {
    if (selectedOptionIndex !== null) {
      updateOption(selectedOptionIndex, 'image', url);
    }
  };

  const handleQuestionImageSelect = (url: string) => {
    updateConfig({ questionImage: url });
  };

  const handleQuestionTypeChange = (type: 'text' | 'image') => {
    setQuestionType(type);
    if (type === 'image') {
      // Clear text when switching to image
      updateConfig({ question: { en: '', ar: '' } });
    } else {
      // Clear image when switching to text
      updateConfig({ questionImage: '' });
    }
  };

  return (
    <div className="space-y-6">

      {/* Display Type Toggle */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Display Above Options</label>
          <div className="inline-flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => handleQuestionTypeChange('text')}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${questionType === 'text'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              📝 Letter/Word
            </button>
            <button
              type="button"
              onClick={() => handleQuestionTypeChange('image')}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${questionType === 'image'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              🖼️ Image
            </button>
          </div>
        </div>
      </div>

      {/* Display Content */}
      <div className="space-y-4">
        {questionType === 'text' ? (
          <FormField label="Letter or Word" hint="Single letter or word to display">
            <TextInput
              value={questionAr}
              onChange={(value) => updateConfig({ question: { en: '', ar: value } })}
              placeholder="أ"
              dir="rtl"
            />
          </FormField>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>
            {questionImage ? (
              <div className="relative inline-block">
                <img
                  src={questionImage}
                  alt="Display"
                  className="max-w-xs max-h-48 rounded-lg border-2 border-gray-200"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setQuestionImageModalOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={() => updateConfig({ questionImage: '' })}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setQuestionImageModalOpen(true)}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors w-full max-w-xs"
              >
                <div className="text-4xl mb-2">🖼️</div>
                <p className="text-sm text-gray-600">Click to select image</p>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="border-t pt-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Answer Type</label>
          <div className="inline-flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => updateMode('text')}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${mode === 'text'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              📝 Text
            </button>
            <button
              type="button"
              onClick={() => updateMode('image')}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${mode === 'image'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              🖼️ Image
            </button>
          </div>
        </div>
      </div>

      {/* Answer Options Grid */}
      <div className="border-t pt-4">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Answer Options</h3>
        </div>

        <div className="grid grid-cols-4 gap-3 max-w-2xl">
          {options.map((option, index) => (
            <OptionSquare
              key={option.id}
              option={option}
              index={index}
              mode={mode}
              onToggleCorrect={(checked) => updateOption(index, 'isCorrect', checked)}
              onUpdateText={(value) => updateOption(index, 'text.ar', value)}
              onOpenImagePicker={() => openImagePicker(index)}
              onClearImage={() => updateOption(index, 'image', '')}
            />
          ))}
        </div>
      </div>

      {/* Image Library Modal for Options */}
      <ImageLibraryModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSelectImage={handleImageSelect}
        currentImage={selectedOptionIndex !== null ? options[selectedOptionIndex]?.image : undefined}
      />

      {/* Image Library Modal for Question */}
      <ImageLibraryModal
        isOpen={questionImageModalOpen}
        onClose={() => setQuestionImageModalOpen(false)}
        onSelectImage={handleQuestionImageSelect}
        currentImage={questionImage}
      />
    </div>
  );
}

/**
 * OptionSquare Component
 * Displays a single option as a square tile
 */
interface OptionSquareProps {
  option: MultipleChoiceOption;
  index: number;
  mode: 'text' | 'image';
  onToggleCorrect: (checked: boolean) => void;
  onUpdateText: (value: string) => void;
  onOpenImagePicker: () => void;
  onClearImage: () => void;
}

function OptionSquare({
  option,
  index,
  mode,
  onToggleCorrect,
  onUpdateText,
  onOpenImagePicker,
  onClearImage,
}: OptionSquareProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState(option.text.ar);

  const handleSaveText = () => {
    onUpdateText(textValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveText();
    } else if (e.key === 'Escape') {
      setTextValue(option.text.ar);
      setIsEditing(false);
    }
  };

  return (
    <div className="relative">
      {/* Correct Answer Checkbox */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <input
          type="checkbox"
          checked={option.isCorrect}
          onChange={(e) => onToggleCorrect(e.target.checked)}
          className="h-3.5 w-3.5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label className="text-xs text-gray-600">
          {index + 1}
          {option.isCorrect && <span className="ml-1 text-green-600">✓</span>}
        </label>
      </div>

      {/* Option Content Square */}
      <div
        className={`
          aspect-square border-2 rounded-lg overflow-hidden
          ${option.isCorrect ? 'border-green-400' : 'border-gray-300'}
          bg-gray-50 flex items-center justify-center
          cursor-pointer hover:border-gray-400 transition-colors
        `}
        onClick={() => {
          if (mode === 'text') {
            setIsEditing(true);
          } else {
            onOpenImagePicker();
          }
        }}
      >
        {mode === 'text' ? (
          isEditing ? (
            <input
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onBlur={handleSaveText}
              onKeyDown={handleKeyDown}
              dir="rtl"
              autoFocus
              className="w-full h-full text-center text-2xl font-semibold bg-white border-2 border-blue-500 outline-none px-1"
              placeholder="كلمة"
            />
          ) : option.text.ar ? (
            <div className="text-2xl font-semibold text-gray-800 p-1 text-center" dir="rtl">
              {option.text.ar}
            </div>
          ) : (
            <div className="text-gray-400 text-xs text-center px-2">
              Click to add
            </div>
          )
        ) : option.image ? (
          <div className="relative w-full h-full group">
            <img
              src={option.image}
              alt={`Option ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClearImage();
              }}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex text-xs"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="text-gray-400 text-xs text-center px-2">
            <div className="text-2xl mb-1">📸</div>
            Click
          </div>
        )}
      </div>
    </div>
  );
}
