import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput, NumberInput, Select } from './FormField';

export function DragDropActivityForm({ config, onChange }: BaseActivityFormProps) {
  const variant = config?.variant || 'animal_mouth';
  const targetAnimal = config?.targetAnimal || 'cow';
  const targetWord = config?.targetWord || '';
  const draggableItems = config?.draggableItems || [];
  const draggableItemsStr = draggableItems.map((item: any) => item.letter).join(', ');
  const correctCount = config?.correctCount || 1;
  const snapToTarget = config?.snapToTarget ?? true;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">

      <FormField label="Variant" hint="Type of drag and drop activity" required>
        <Select
          value={variant}
          onChange={(value) => updateConfig({ variant: value })}
          options={[
            { value: 'animal_mouth', label: 'Animal Mouth' },
            { value: 'word_slots', label: 'Word Slots' },
            { value: 'letter_matching', label: 'Letter Matching' },
          ]}
        />
      </FormField>

      {variant === 'animal_mouth' && (
        <FormField label="Target Animal" hint="Which animal to feed" required>
          <Select
            value={targetAnimal}
            onChange={(value) => updateConfig({ targetAnimal: value })}
            options={[
              { value: 'cow', label: 'Cow' },
              { value: 'donkey', label: 'Donkey' },
              { value: 'sheep', label: 'Sheep' },
              { value: 'bird', label: 'Bird' },
            ]}
          />
        </FormField>
      )}

      {variant === 'word_slots' && (
        <FormField label="Target Word" hint="The word to complete" required>
          <TextInput
            value={targetWord}
            onChange={(value) => updateConfig({ targetWord: value })}
            placeholder="كلمة"
            dir="rtl"
          />
        </FormField>
      )}

      <FormField label="Draggable Items" hint="Comma-separated letters" required>
        <TextInput
          value={draggableItemsStr}
          onChange={(value) => {
            const letters = value.split(',').map(l => l.trim());
            const items = letters.map((letter, idx) => ({
              id: `item_${idx}`,
              letter,
              isCorrect: idx < correctCount, // First N items are correct
            }));
            updateConfig({ draggableItems: items });
          }}
          placeholder="أ, ب, ت, ث"
          dir="rtl"
        />
      </FormField>

      <FormField label="Correct Count" hint="How many items are correct" required>
        <NumberInput
          value={correctCount}
          onChange={(value) => updateConfig({ correctCount: value })}
          min={1}
        />
      </FormField>

      <FormField label="Snap to Target" hint="Auto-snap when close">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={snapToTarget}
            onChange={(e) => updateConfig({ snapToTarget: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Enable snap-to-target
          </label>
        </div>
      </FormField>
    </div>
  );
}
