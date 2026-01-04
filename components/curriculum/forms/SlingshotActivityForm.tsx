import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput } from './FormField';
import { LetterSelector } from './shared/LetterSelector';
import { OptionSelector } from './OptionSelector';
import type { SlingshotConfig } from '@kalam/curriculum-schemas';

export function SlingshotActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
    const typedConfig = (config || {}) as Partial<SlingshotConfig>;
    const distractors = typedConfig.distractorLetters || [];
    const distractorLettersStr = Array.isArray(distractors) ? distractors.join(', ') : '';

    const handleChange = (key: keyof SlingshotConfig, value: any) => {
        onChange({ ...typedConfig, [key]: value });
    };

    return (
        <div className="space-y-6">
            <FormField label="Target Letter" hint="The letter on the target boxes">
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
                <FormField label="Target Count" hint="Number of hits needed to win">
                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={typedConfig.targetCount || 3}
                        onChange={(e) => handleChange('targetCount', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </FormField>

                <FormField label="Difficulty">
                    <OptionSelector
                        options={[
                            { value: 'easy', label: 'Easy (Stable stack)' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'hard', label: 'Hard (Unstable stack)' },
                        ]}
                        value={typedConfig.difficulty || 'medium'}
                        onChange={(value) => handleChange('difficulty', value)}
                    />
                </FormField>
            </div>
        </div>
    );
}
