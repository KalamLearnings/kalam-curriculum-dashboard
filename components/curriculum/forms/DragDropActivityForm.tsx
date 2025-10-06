import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput, Select } from './FormField';

export function DragDropActivityForm({ config, onChange }: BaseActivityFormProps) {
  const variant = config?.variant || 'animal_mouth';
  const draggableItems = config?.draggableItems || [];
  const targetText = config?.targetText || '';

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  const updateDraggableItem = (index: number, updates: Partial<any>) => {
    const newItems = [...draggableItems];
    newItems[index] = { ...newItems[index], ...updates };
    updateConfig({ draggableItems: newItems });
  };

  const addDraggableItem = () => {
    const newItem = variant === 'animal_mouth'
      ? { letter: '', isCorrect: false, targetIndex: 0 }
      : variant === 'word_slots'
      ? { letter: '', correctSlot: 0 }
      : { letter: '', matchingLetter: '' };
    updateConfig({ draggableItems: [...draggableItems, newItem] });
  };

  const removeDraggableItem = (index: number) => {
    const newItems = draggableItems.filter((_: any, i: number) => i !== index);
    updateConfig({ draggableItems: newItems });
  };

  return (
    <div className="space-y-4">
      <FormField label="Variant" required hint="Type of drag and drop activity">
        <Select
          value={variant}
          onChange={(value) => {
            updateConfig({ variant: value, draggableItems: [] });
          }}
          options={[
            { value: 'animal_mouth', label: 'Animal Mouth' },
            { value: 'word_slots', label: 'Word Slots' },
            { value: 'letter_matching', label: 'Letter Matching' },
          ]}
        />
      </FormField>

      {variant === 'word_slots' && (
        <FormField label="Target Text" required hint="The word to build">
          <TextInput
            value={targetText}
            onChange={(value) => updateConfig({ targetText: value })}
            required
            dir="rtl"
            placeholder="كتاب"
          />
        </FormField>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Draggable Items <span className="text-red-500">*</span>
        </label>
        {draggableItems.map((item: any, index: number) => (
          <div key={index} className="p-3 bg-gray-50 rounded-md space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <TextInput
                  value={item.letter}
                  onChange={(value) => updateDraggableItem(index, { letter: value })}
                  required
                  dir="rtl"
                  placeholder="Letter"
                />
              </div>
              <button
                type="button"
                onClick={() => removeDraggableItem(index)}
                className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
              >
                Remove
              </button>
            </div>

            {variant === 'animal_mouth' && (
              <div className="flex gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.isCorrect}
                    onChange={(e) => updateDraggableItem(index, { isCorrect: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Is Correct</span>
                </label>
              </div>
            )}

            {variant === 'word_slots' && (
              <div>
                <TextInput
                  type="number"
                  value={item.correctSlot?.toString() || '0'}
                  onChange={(value) => updateDraggableItem(index, { correctSlot: parseInt(value) })}
                  placeholder="Correct Slot Index"
                />
              </div>
            )}

            {variant === 'letter_matching' && (
              <div>
                <TextInput
                  value={item.matchingLetter}
                  onChange={(value) => updateDraggableItem(index, { matchingLetter: value })}
                  dir="rtl"
                  placeholder="Matching Letter"
                />
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addDraggableItem}
          className="w-full px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
        >
          + Add Item
        </button>
      </div>
    </div>
  );
}
