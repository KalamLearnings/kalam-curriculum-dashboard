import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput } from './FormField';

export function PizzaActivityForm({ config, onChange }: BaseActivityFormProps) {
  const toppings = config?.toppings || [
    { emoji: '🍕', letter: '', isCorrect: true },
    { emoji: '🍕', letter: '', isCorrect: false },
  ];

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  const updateTopping = (index: number, updates: Partial<typeof toppings[0]>) => {
    const newToppings = [...toppings];
    newToppings[index] = { ...newToppings[index], ...updates };
    updateConfig({ toppings: newToppings });
  };

  const addTopping = () => {
    updateConfig({ toppings: [...toppings, { emoji: '🍕', letter: '', isCorrect: false }] });
  };

  const removeTopping = (index: number) => {
    if (toppings.length > 2) {
      const newToppings = toppings.filter((_: any, i: number) => i !== index);
      updateConfig({ toppings: newToppings });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Toppings <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500">
          Each topping represents a letter option. Mark correct ones.
        </p>
        {toppings.map((topping: any, index: number) => (
          <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-md">
            <div className="w-20">
              <TextInput
                value={topping.emoji}
                onChange={(value) => updateTopping(index, { emoji: value })}
                placeholder="🍕"
              />
            </div>
            <div className="flex-1">
              <TextInput
                value={topping.letter}
                onChange={(value) => updateTopping(index, { letter: value })}
                required
                dir="rtl"
                placeholder="Letter"
              />
            </div>
            <label className="flex items-center gap-2 whitespace-nowrap">
              <input
                type="checkbox"
                checked={topping.isCorrect}
                onChange={(e) => updateTopping(index, { isCorrect: e.target.checked })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Correct</span>
            </label>
            {toppings.length > 2 && (
              <button
                type="button"
                onClick={() => removeTopping(index)}
                className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addTopping}
          className="w-full px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
        >
          + Add Topping
        </button>
      </div>
    </div>
  );
}
