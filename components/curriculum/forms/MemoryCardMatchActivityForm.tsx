
import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput } from './FormField';
import { OptionSelector } from './OptionSelector';
import type { MemoryCardMatchConfig } from '@kalam/curriculum-schemas';

export function MemoryCardMatchActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
    const typedConfig = (config || {}) as Partial<MemoryCardMatchConfig>;
    const letters = typedConfig.letters || [];
    const lettersStr = Array.isArray(letters) ? letters.join(', ') : '';

    const handleChange = (key: keyof MemoryCardMatchConfig, value: any) => {
        onChange({ ...typedConfig, [key]: value });
    };

    return (
        <div className="space-y-6">
            <FormField label="Letters to Match" hint="Letters to include in the game (comma-separated)">
                <TextInput
                    value={lettersStr}
                    onChange={(value) => {
                        const letterList = value.split(',').map(l => l.trim()).filter(l => l);
                        handleChange('letters', letterList);
                    }}
                    placeholder="أ, ب, ت, ث"
                    dir="rtl"
                />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
                <FormField label="Card Count" hint="Total number of cards (must be even)">
                    <input
                        type="number"
                        min="4"
                        max="24"
                        step="2"
                        value={typedConfig.cardCount || 8}
                        onChange={(e) => handleChange('cardCount', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </FormField>

                <FormField label="Time Limit (seconds)" hint="Optional">
                    <input
                        type="number"
                        min="0"
                        value={typedConfig.timeLimit || ''}
                        onChange={(e) => handleChange('timeLimit', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="No limit"
                    />
                </FormField>
            </div>

            <FormField label="Match Type">
                <OptionSelector
                    options={[
                        { value: 'letter_to_letter', label: 'Letter to Letter' },
                        { value: 'letter_to_sound', label: 'Letter to Sound' },
                        { value: 'form_to_form', label: 'Form to Form' },
                    ]}
                    value={typedConfig.matchType || 'letter_to_letter'}
                    onChange={(value) => handleChange('matchType', value)}
                />
            </FormField>

            <FormField label="Show Hints">
                <input
                    type="checkbox"
                    checked={typedConfig.showHints === true}
                    onChange={(e) => handleChange('showHints', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Show hints after delay</span>
            </FormField>
        </div>
    );
}
