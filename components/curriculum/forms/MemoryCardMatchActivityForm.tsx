
import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField } from './FormField';
import { LetterSelector } from '../LetterSelector';
import { OptionSelector } from './OptionSelector';
import type { MemoryCardMatchConfig } from '@kalam/curriculum-schemas';

export function MemoryCardMatchActivityForm({ config, onChange }: BaseActivityFormProps) {
    const typedConfig = (config || {}) as Partial<MemoryCardMatchConfig>;
    const letters = typedConfig.letters || [];

    const handleChange = (key: keyof MemoryCardMatchConfig, value: any) => {
        onChange({ ...typedConfig, [key]: value });
    };

    const addLetter = (letter: any) => {
        if (letter && !letters.includes(letter.id)) {
            handleChange('letters', [...letters, letter.id]);
        }
    };

    const removeLetter = (letterId: string) => {
        handleChange('letters', letters.filter(l => l !== letterId));
    };

    return (
        <div className="space-y-6">
            <FormField
                label="Letters to Match"
                hint="Select letters to include in the game"
            >
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {letters.map(l => (
                            <span key={l} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {l}
                                <button
                                    type="button"
                                    onClick={() => removeLetter(l)}
                                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        {letters.length === 0 && (
                            <span className="text-sm text-gray-500 italic">No letters selected</span>
                        )}
                    </div>
                    <LetterSelector
                        value=""
                        onChange={(letter) => addLetter(letter)}
                        label="Add Letter"
                    />
                </div>
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
