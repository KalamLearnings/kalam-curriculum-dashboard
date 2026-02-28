import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput, NumberInput, Select } from './FormField';
import { LetterSelector } from './shared/LetterSelector';
import type { LetterReference } from './ArabicLetterGrid';

export function PizzaActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  // targetLetter is now a LetterReference
  const targetLetter: LetterReference | null = config?.targetLetter || null;
  const toppings = config?.toppings || [];
  const toppingsStr = toppings.map((t: any) => `${t.letter}:${t.name}`).join(', ');
  const requiredToppingsCount = config?.requiredToppingsCount || 2;
  const pizzaSize = config?.pizzaSize || 'medium';
  const showToppingNames = config?.showToppingNames ?? true;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <FormField label="Target Letter" hint="The letter to find in toppings" required>
        <LetterSelector
          value={targetLetter}
          onChange={(value) => updateConfig({ targetLetter: value })}
          topic={topic}
          showFormSelector={false}
        />
      </FormField>

      <FormField
        label="Toppings"
        hint="Format: letter:name, separated by commas (e.g., أ:cheese, ب:olive)"
        required
      >
        <TextInput
          value={toppingsStr}
          onChange={(value) => {
            const items = value.split(',').map((item, idx) => {
              const [letter, name] = item.trim().split(':');
              return {
                id: `topping_${idx}`,
                letter: letter?.trim() || '',
                name: name?.trim() || '',
                image: `${name?.trim() || 'default'}.png`,
                // Note: isCorrect is now determined by backend when resolving targetLetter
              };
            });
            updateConfig({ toppings: items });
          }}
          placeholder="أ:cheese, ب:olive, ت:tomato"
        />
      </FormField>

      <FormField label="Required Toppings Count" hint="How many correct toppings needed" required>
        <NumberInput
          value={requiredToppingsCount}
          onChange={(value) => updateConfig({ requiredToppingsCount: value })}
          min={1}
          max={6}
        />
      </FormField>

      <FormField label="Pizza Size" hint="Size of the pizza">
        <Select
          value={pizzaSize}
          onChange={(value) => updateConfig({ pizzaSize: value })}
          options={[
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
          ]}
        />
      </FormField>

      <FormField label="Show Topping Names" hint="Display topping names">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={showToppingNames}
            onChange={(e) => updateConfig({ showToppingNames: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Show names
          </label>
        </div>
      </FormField>
    </div>
  );
}
