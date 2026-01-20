
import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField } from './FormField';
import { OptionSelector } from './OptionSelector';
import { useLetters } from '@/lib/hooks/useLetters';
import type { MemoryCardMatchConfig } from '@kalam/curriculum-schemas';

export function MemoryCardMatchActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
    const typedConfig = (config || {}) as Partial<MemoryCardMatchConfig>;
    const letters: string[] = typedConfig.letters || [];
    const { letters: allLetters, loading: lettersLoading } = useLetters();

    const handleChange = (key: keyof MemoryCardMatchConfig, value: any) => {
        onChange({ ...typedConfig, [key]: value });
    };

    const toggleLetter = (letter: string) => {
        if (letters.includes(letter)) {
            handleChange('letters', letters.filter(l => l !== letter));
        } else {
            handleChange('letters', [...letters, letter]);
        }
    };

    return (
        <div className="space-y-6">
            <FormField label="Letters to Match" hint="Select the letters to include in the game (click to toggle)" required>
                {lettersLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-gray-500">Loading letters...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-7 gap-2">
                        {allLetters.map((letter) => {
                            const isSelected = letters.includes(letter.letter);

                            return (
                                <button
                                    key={letter.id}
                                    type="button"
                                    onClick={() => toggleLetter(letter.letter)}
                                    className={`
                                        aspect-square rounded-lg border-2 transition-all
                                        flex flex-col items-center justify-center
                                        ${isSelected
                                            ? 'border-blue-600 bg-blue-100 ring-2 ring-blue-600 ring-offset-1'
                                            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                                        }
                                    `}
                                    title={letter.name_english}
                                >
                                    <div className="text-2xl font-arabic mb-0.5">{letter.letter}</div>
                                    <div className="text-xs text-gray-600 truncate px-1">{letter.name_english}</div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </FormField>

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
