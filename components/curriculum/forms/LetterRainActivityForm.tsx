import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField } from './FormField';
import { LetterSelector } from '../LetterSelector';
import { OptionSelector } from './OptionSelector';
import type { LetterRainConfig } from '@kalam/curriculum-schemas';

export function LetterRainActivityForm({ config, onChange }: BaseActivityFormProps) {
    const typedConfig = (config || {}) as Partial<LetterRainConfig>;
    const distractors = typedConfig.distractorLetters || [];

    const handleChange = (key: keyof LetterRainConfig, value: any) => {
        onChange({ ...typedConfig, [key]: value });
    };

    const addDistractor = (letter: any) => {
        if (letter && !distractors.includes(letter.id)) {
            handleChange('distractorLetters', [...distractors, letter.id]);
        }
    };

    const removeDistractor = (letterId: string) => {
        handleChange('distractorLetters', distractors.filter(d => d !== letterId));
    };

    return (
        <div className="space-y-6">
            <FormField label="Target Letter" hint="The letter the student needs to catch">
                <LetterSelector
                    value={typedConfig.targetLetter || ''}
                    onChange={(letter) => handleChange('targetLetter', letter?.id)}
                />
            </FormField>

            <FormField
                label="Distractor Letters"
                hint="Letters to avoid catching"
            >
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {distractors.map(d => (
                            <span key={d} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {d}
                                <button
                                    type="button"
                                    onClick={() => removeDistractor(d)}
                                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        {distractors.length === 0 && (
                            <span className="text-sm text-gray-500 italic">No distractors selected</span>
                        )}
                    </div>
                    <LetterSelector
                        value=""
                        onChange={(letter) => addDistractor(letter)}
                        label="Add Distractor"
                    />
                </div>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
                <FormField label="Target Count" hint="Number of correct catches needed">
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={typedConfig.targetCount || 5}
                        onChange={(e) => handleChange('targetCount', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </FormField>

                <FormField label="Speed Multiplier" hint="1.0 = Normal, 2.0 = Fast">
                    <input
                        type="number"
                        min="0.5"
                        max="3.0"
                        step="0.1"
                        value={typedConfig.speed || 1.0}
                        onChange={(e) => handleChange('speed', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </FormField>
            </div>

            <FormField label="Difficulty">
                <OptionSelector
                    options={[
                        { value: 'easy', label: 'Easy (Slower, fewer distractors)' },
                        { value: 'medium', label: 'Medium (Normal)' },
                        { value: 'hard', label: 'Hard (Faster, more distractors)' },
                    ]}
                    value={typedConfig.difficulty || 'medium'}
                    onChange={(value) => handleChange('difficulty', value)}
                />
            </FormField>
        </div>
    );
}
