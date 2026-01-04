import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput } from './FormField';
import { LetterSelector } from './shared/LetterSelector';
import { OptionSelector } from './OptionSelector';
import type { LetterRainConfig } from '@kalam/curriculum-schemas';

export function LetterRainActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
    const typedConfig = (config || {}) as Partial<LetterRainConfig>;
    const distractors = typedConfig.distractorLetters || [];
    const distractorLettersStr = Array.isArray(distractors) ? distractors.join(', ') : '';

    const handleChange = (key: keyof LetterRainConfig, value: any) => {
        onChange({ ...typedConfig, [key]: value });
    };

    return (
        <div className="space-y-6">
            <FormField label="Target Letter" hint="The letter the student needs to catch">
                <LetterSelector
                    value={typedConfig.targetLetter || ''}
                    onChange={(value) => handleChange('targetLetter', value)}
                    topic={topic}
                />
            </FormField>

            <FormField label="Distractor Letters" hint="Wrong letters (comma-separated)">
                <TextInput
                    value={distractorLettersStr}
                    onChange={(value) => {
                        const letters = value.split(',').map(l => l.trim()).filter(l => l);
                        handleChange('distractorLetters', letters);
                    }}
                    placeholder="ب, ت, ث"
                    dir="rtl"
                />
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
